import React, { useEffect, useMemo, useState } from 'react';
import type { Prediction, ReferralSite } from '../../types';
import { mapDeepAnalyticsPayload, shortInsightSummary, type MappedDeepAnalytics } from '../../match/mapDeepAnalytics';
import {
  fetchDeepAnalytics,
  fetchWebMatches,
  findMatchInWebList,
  resolveWebApiBase,
} from '../../utils/webApi';
import type { BusinessActionsPublic } from '../../utils/referralLinks';
import { MatchHeader } from './MatchHeader';
import { MatchPredictionPanel } from './MatchPredictionPanel';
import { MatchInsightSummary } from './MatchInsightSummary';
import { MatchAnalyticsGrid } from './MatchAnalyticsGrid';
import { MatchDeepAnalysis } from './MatchDeepAnalysis';
import { MatchBusinessActions } from './MatchBusinessActions';
import { MatchEditorialSummary } from './MatchEditorialSummary';

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
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

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
}) => {
  const webApiBase = useMemo(() => resolveWebApiBase(webappApiBase), [webappApiBase]);
  const [match, setMatch] = useState<Prediction>(seed);
  const [analytics, setAnalytics] = useState<MappedDeepAnalytics | null>(null);
  const [serverVerified, setServerVerified] = useState<boolean>(isVerified);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    setMatch(seed);
  }, [seed.id, seed.fixture_id]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoadState('loading');
      setAnalyticsError(null);
      try {
        const [matchesRes, deepRes] = await Promise.all([
          fetchWebMatches(webApiBase, sessionToken).catch(() => null),
          fetchDeepAnalytics(webApiBase, sessionToken, {
            p1: seed.home_name,
            p2: seed.away_name,
            surface: seed.surface,
            asOfDate: seed.match_date,
          }).catch((e: Error) => {
            setAnalyticsError(e.message || 'Failed to load analytics');
            return null;
          }),
        ]);

        if (cancelled) return;

        if (matchesRes?.matches) {
          const found = findMatchInWebList(matchesRes.matches, seed);
          if (found) setMatch(found);
          if (typeof matchesRes.verified === 'boolean') setServerVerified(matchesRes.verified);
        }

        if (deepRes) {
          if (typeof deepRes.verified === 'boolean') setServerVerified(deepRes.verified);
          setAnalytics(
            mapDeepAnalyticsPayload({
              content_locked: deepRes.content_locked,
              guest_stats_level: deepRes.guest_stats_level,
              verified: deepRes.verified,
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
  }, [webApiBase, sessionToken, seed.home_name, seed.away_name, seed.surface, seed.match_date, seed.id, seed.fixture_id]);

  // SEO basics
  useEffect(() => {
    const title = `${match.home_name} vs ${match.away_name} Analysis | Ptin AI`;
    const prev = document.title;
    document.title = title;
    return () => {
      document.title = prev;
    };
  }, [match.home_name, match.away_name]);

  const freeMode = accessMode === 'FREE';
  const member = freeMode || serverVerified || isVerified;
  const contentLocked = match.content_locked === true && !member;
  const canSeeFullAi = member || match.content_locked === false;
  const summary = shortInsightSummary(match.ai_summary);

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
      <div className="glass" style={{ padding: '1.5rem', borderRadius: 14, color: '#fca5a5' }}>
        Could not open this match. <button type="button" onClick={onBack}>Back</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.35rem 0 2rem' }}>
      <MatchHeader
        match={match}
        selectedTimezone={selectedTimezone}
        onBack={onBack}
        onShare={handleShare}
      />

      <MatchPredictionPanel match={match} />

      <MatchBusinessActions
        match={match}
        sites={referralSites}
        apiBase={webappApiBase}
        trackingId={trackingId}
        isVerified={member}
        businessActions={businessActions}
        onRegisterInfoClick={onUnlockClick}
      />

      <MatchInsightSummary summary={summary} loading={loadState === 'loading' && !summary} />

      <MatchEditorialSummary
        apiBase={webappApiBase}
        fixtureId={match.fixture_id || match.id}
        sessionToken={sessionToken}
      />

      <MatchAnalyticsGrid
        analytics={analytics}
        loading={loadState === 'loading'}
        error={analyticsError}
        homeName={match.home_name}
        awayName={match.away_name}
        onUnlockClick={contentLocked ? onUnlockClick : undefined}
      />

      <MatchDeepAnalysis
        match={match}
        analytics={analytics}
        canSeeFullAi={canSeeFullAi}
        onUnlockClick={onUnlockClick}
      />

      {loadState === 'ready' && contentLocked && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Public preview · deeper dossiers reserved for members
        </div>
      )}
    </div>
  );
};
