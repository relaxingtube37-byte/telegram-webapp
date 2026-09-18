import React, { useEffect, useMemo, useState } from 'react';
import type { Prediction, ReferralSite } from '../../types';
import { mapDeepAnalyticsPayload, type MappedDeepAnalytics } from '../../match/mapDeepAnalytics';
import {
  fetchDeepAnalytics,
  fetchWebMatches,
  findMatchInWebList,
  resolveWebApiBase,
} from '../../utils/webApi';
import type { BusinessActionsPublic } from '../../utils/referralLinks';
import { MatchHeader } from './MatchHeader';
import { MatchPredictionPanel } from './MatchPredictionPanel';
import { MatchAnalyticsGrid } from './MatchAnalyticsGrid';
import { MatchDeepAnalysis } from './MatchDeepAnalysis';
import { MatchBusinessActions } from './MatchBusinessActions';
import { MatchEditorialSummary } from './MatchEditorialSummary';
import { ProIntelligenceCard } from './ProIntelligenceCard';
import type { ProIntelligencePayload } from '../../types';
import { useTranslation } from '../../i18n';

interface MatchAnalysisPageProps {
  prediction: Prediction;
  selectedTimezone: string;
  webappApiBase: string;
  sessionToken?: string | null;
  isVerified?: boolean;
  accessMode?: string;
  onBack: () => void;
  onUnlockClick?: () => void;
  referralSites?: ReferralSite[];
  trackingId?: string | number;
  businessActions?: BusinessActionsPublic;
  onVerified?: () => void;
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error';
type SubTab = 'all' | 'tactical' | 'stats' | 'editorial';

export const MatchAnalysisPage: React.FC<MatchAnalysisPageProps> = ({
  prediction: seed,
  selectedTimezone,
  webappApiBase,
  sessionToken,
  isVerified = false,
  accessMode = 'REGISTRATION_REQUIRED',
  onBack,
  onUnlockClick,
  referralSites = [],
  trackingId = 'anonymous',
  businessActions = {
    registration_referral_enabled: true,
    watch_live_enabled: true,
    payment_mode_placeholder_enabled: false,
  },
  onVerified,
}) => {
  const { t, language } = useTranslation();
  const webApiBase = useMemo(() => resolveWebApiBase(webappApiBase), [webappApiBase]);
  const isFreeMode = accessMode === 'FREE';
  const isLoggedOut = typeof window !== 'undefined' && localStorage.getItem('ptin_user_logged_out') === 'true';
  const isClientVerified = isFreeMode || (!isLoggedOut && Boolean(isVerified));

  const [match, setMatch] = useState<Prediction>(() => ({
    ...seed,
    content_locked: isFreeMode ? false : (!isClientVerified ? true : (seed.content_locked ?? false)),
  }));
  const [analytics, setAnalytics] = useState<MappedDeepAnalytics | null>(null);
  const [proIntel, setProIntel] = useState<ProIntelligencePayload | null>(null);
  const [serverVerified, setServerVerified] = useState<boolean>(isClientVerified);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SubTab>('all');

  const member = isFreeMode || (!isLoggedOut && (isClientVerified || serverVerified));
  const contentLocked = !member;
  const canSeeFullAi = member;

  // Keep shallow seed updates  // Sync seed prediction updates (e.g. live score ticks, language projections)
  useEffect(() => {
    setMatch(prev => ({
      ...prev,
      ...seed,
      content_locked: isFreeMode ? false : (!isClientVerified ? true : (prev.content_locked ?? false)),
    }));
  }, [seed, isClientVerified, isFreeMode]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoadState('loading');
      setAnalyticsError(null);
      try {
        const fixtureTargetId = seed.fixture_id || seed.id;
        const [matchesRes, deepRes, proIntelRes] = await Promise.all([
          fetchWebMatches(webApiBase, sessionToken, 100, language).catch(() => null),
          fetchDeepAnalytics(webApiBase, sessionToken, {
            p1: seed.home_name,
            p2: seed.away_name,
            surface: seed.surface,
            asOfDate: seed.match_date,
            lang: language,
          }).catch((e: Error) => {
            setAnalyticsError(e.message || 'Failed to load analytics');
            return null;
          }),
          fixtureTargetId
            ? fetch(`${(webappApiBase || '').replace(/\/+$/, '')}/matches/${fixtureTargetId}/pro-intelligence?lang=${encodeURIComponent(language)}`)
                .then(r => r.ok ? r.json() : fetch(`${webApiBase}/matches/${fixtureTargetId}/pro-intelligence?lang=${encodeURIComponent(language)}`).then(r2 => r2.ok ? r2.json() : null))
                .then(j => j?.data || null)
                .catch(() => null)
            : Promise.resolve(null),
        ]);

        if (cancelled) return;
        if (proIntelRes) setProIntel(proIntelRes);

        if (matchesRes?.matches) {
          const found = findMatchInWebList(matchesRes.matches, seed);
          if (found) {
            setMatch({
              ...found,
              content_locked: isFreeMode ? false : (!isClientVerified ? true : (found.content_locked ?? false)),
            });
          }
          if (typeof matchesRes.verified === 'boolean') {
            setServerVerified(isFreeMode || (!isLoggedOut && matchesRes.verified));
          }
        }

        if (deepRes) {
          const verifiedFlag = isFreeMode || (!isLoggedOut && (isClientVerified || !!deepRes.verified));
          if (typeof deepRes.verified === 'boolean') {
            setServerVerified(verifiedFlag);
          }
          setAnalytics(
            mapDeepAnalyticsPayload({
              content_locked: isFreeMode ? false : !verifiedFlag,
              guest_stats_level: (isFreeMode || verifiedFlag) ? 'full' : (deepRes.guest_stats_level || 'none'),
              verified: isFreeMode || verifiedFlag,
              data: deepRes.data,
            })
          );
        } else {
          setAnalytics(null);
        }
        setLoadState('ready');
      } catch (e: any) {
        if (!cancelled) {
          setLoadState('error');
          setAnalyticsError(e?.message || 'Failed to load match page');
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [webApiBase, sessionToken, seed.home_name, seed.away_name, seed.surface, seed.match_date, seed.id, seed.fixture_id, isClientVerified, isLoggedOut, language]);

  // SEO document title
  useEffect(() => {
    const title = `${match.home_name} vs ${match.away_name} Analysis | Ptin AI`;
    const prev = document.title;
    document.title = title;
    return () => {
      document.title = prev;
    };
  }, [match.home_name, match.away_name]);


  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `${match.home_name} vs ${match.away_name}`, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).catch(() => {});
    }
  };

  if (loadState === 'error' && !match.home_name) {
    return (
      <div className="glass" style={{ padding: '1.5rem', borderRadius: 14, color: '#fca5a5', display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'flex-start' }}>
        <div>Could not open this match data.</div>
        <button type="button" className="btn-secondary" onClick={onBack} style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}>
          Back to all matches
        </button>
      </div>
    );
  }

  return (
    <div className="master-match-card-container">
      {/* ── Unified Master Match Header (Hero, Scoreboard & Docked Sub-tabs) ── */}
      <MatchHeader
        match={match}
        selectedTimezone={selectedTimezone}
        onBack={onBack}
        onShare={handleShare}
        sites={referralSites}
        apiBase={webappApiBase}
        trackingId={trackingId}
        isVerified={member}
        businessActions={businessActions}
        onUnlockClick={onUnlockClick}
        onVerified={onVerified}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* ── Match Details Content Body ── */}
      <div className="match-card-body-stack">
        {/* Unified AI Prediction & Tactical Dossier Hub (Shown in 'all' and 'tactical') */}
        {(activeTab === 'all' || activeTab === 'tactical') && (
          <div className="unified-ai-hub">
            <MatchPredictionPanel match={match} onUnlockClick={onUnlockClick} />
            <MatchDeepAnalysis
              match={match}
              analytics={analytics}
              canSeeFullAi={canSeeFullAi}
              onUnlockClick={onUnlockClick}
            />
          </div>
        )}

        {/* Pro Tour Skills Decagon & Proprietary Intel (Shown in 'all' and 'stats') */}
        {(activeTab === 'all' || activeTab === 'stats') && (
          proIntel ? (
            <ProIntelligenceCard
              intel={proIntel}
              surface={match.surface}
              homeName={match.home_name}
              awayName={match.away_name}
              h2hSummary={analytics?.h2h}
              p1Form={analytics?.p1Form ? { currentStreak: analytics.p1Form.currentStreak, recentScores: analytics.p1Form.recentScores } : null}
              p2Form={analytics?.p2Form ? { currentStreak: analytics.p2Form.currentStreak, recentScores: analytics.p2Form.recentScores } : null}
              isLocked={contentLocked}
              onUnlockClick={contentLocked ? onUnlockClick : undefined}
            />
          ) : (
            <MatchAnalyticsGrid
              analytics={analytics}
              loading={loadState === 'loading'}
              error={analyticsError}
              homeName={match.home_name}
              awayName={match.away_name}
              surface={match.surface}
              homeOdds={match.home_odds}
              awayOdds={match.away_odds}
              homeImage={match.home_image}
              awayImage={match.away_image}
              onUnlockClick={contentLocked ? onUnlockClick : undefined}
            />
          )
        )}

        {/* Official Editorial & Story (Shown in 'all' and 'editorial') */}
        {(activeTab === 'all' || activeTab === 'editorial') && (
          <MatchEditorialSummary
            apiBase={webappApiBase}
            fixtureId={match.fixture_id || match.id}
            sessionToken={sessionToken}
          />
        )}

        {loadState === 'ready' && contentLocked && (
          <div className="match-card-preview-notice">
            {t('matchAnalysisPage.previewNotice', 'Public preview · deeper dossiers reserved for registered members')}
          </div>
        )}
      </div>
    </div>
  );
};
