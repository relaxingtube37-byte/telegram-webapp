import React from 'react';
import { ArrowLeft, Share2, Clock, Sparkles, Tv, Lock, Layers, BarChart3, Newspaper } from 'lucide-react';
import type { Prediction, ReferralSite } from '../../types';
import {
  formatMatchTime,
  getMatchGender,
  getSurfaceEmoji,
  parseTennisScore,
} from '../../utils/formatters';
import {
  buildGoReferralUrl,
  openExternalLink,
  shouldShowWatchLive,
  type BusinessActionsPublic,
} from '../../utils/referralLinks';
import { MatchLiveStatus } from './MatchLiveStatus';
import { PlayerAvatar } from '../PlayerAvatar';
import { getPlayerImageUrl } from '../../utils/playerImage';
import { useTranslation } from '../../i18n';

interface MatchHeaderProps {
  match: Prediction;
  selectedTimezone: string;
  onBack: () => void;
  onShare?: () => void;
  sites?: ReferralSite[];
  apiBase?: string;
  trackingId?: string | number;
  isVerified?: boolean;
  businessActions?: BusinessActionsPublic;
  onUnlockClick?: () => void;
  onVerified?: () => void;
  activeTab?: 'all' | 'tactical' | 'stats' | 'editorial';
  onTabChange?: (tab: 'all' | 'tactical' | 'stats' | 'editorial') => void;
}

export const MatchHeader: React.FC<MatchHeaderProps> = ({
  match,
  selectedTimezone,
  onBack,
  onShare,
  sites = [],
  apiBase = '',
  trackingId = 'anonymous',
  isVerified = false,
  businessActions = {
    registration_referral_enabled: true,
    watch_live_enabled: true,
    payment_mode_placeholder_enabled: false,
  },
  onUnlockClick,
  activeTab = 'all',
  onTabChange,
}) => {
  const { t } = useTranslation();
  const gender = getMatchGender(
    match.tournament_name,
    match.round_name,
    `${match.home_name} vs ${match.away_name}`,
    match.home_name,
    match.away_name,
    match.gender
  );
  const isWomen = gender === 'women';
  const tour = isWomen ? 'WTA' : 'ATP';

  const isRowLocked = match.content_locked === true;
  const isHomeWinner = !isRowLocked && Boolean(match.predicted_winner && match.predicted_winner !== 'LOCKED' && match.predicted_winner === match.home_name);
  const isAwayWinner = !isRowLocked && Boolean(match.predicted_winner && match.predicted_winner !== 'LOCKED' && match.predicted_winner === match.away_name);

  const rawScore = (match.result_score || '').trim();
  const rawDateStr = match.match_date || match.published_at;
  const isMatchInFuture = rawDateStr ? new Date(rawDateStr).getTime() > Date.now() + 15 * 60 * 1000 : false;
  const isZeroScore = !rawScore || rawScore === '0-0   0-0    0-0' || rawScore === '0-0' || rawScore === '0:0';

  // Safeguard: unstarted matches with zero score must not show as LIVE
  const effectiveStatus: Prediction['status'] = (match.status === 'LIVE' && isZeroScore && isMatchInFuture)
    ? 'UPCOMING'
    : match.status;

  const parsedScore = parseTennisScore(match.result_score, effectiveStatus);
  const isLive = effectiveStatus === 'LIVE';
  const isFinished = effectiveStatus === 'WON' || effectiveStatus === 'LOST' || effectiveStatus === 'VOID';

  // Integrated business actions
  const primarySite = sites[0];
  const showRegister = businessActions.registration_referral_enabled !== false && !isVerified && !!primarySite;
  const showWatch = businessActions.watch_live_enabled !== false && !!primarySite && shouldShowWatchLive(match.status, match.match_date);

  const handlePartnerAction = (action: 'registration' | 'watch_live') => {
    if (!primarySite) return;
    const url = buildGoReferralUrl(apiBase, primarySite.id, trackingId, {
      action,
      matchId: match.id,
      fixtureId: match.fixture_id,
      page: 'match_header',
    });
    if (url) openExternalLink(url);
    else onUnlockClick?.();
  };

  return (
    <div className={`match-master-header-card ${isWomen ? 'arena-wta' : 'arena-atp'}`}>
      {/* ── 1. Integrated Top Navigation & Tournament Bar ── */}
      <div className="match-master-nav-row">
        <button
          type="button"
          onClick={onBack}
          className="btn-back-to-matches"
          title={t('matchHeader.backToList', 'Back to matches list')}
        >
          <ArrowLeft size={16} />
          <span>{t('matchHeader.allMatches', 'All Matches')}</span>
        </button>

        <div className="match-hero-meta-capsule">
          <span className={`hero-tour-pill ${isWomen ? 'tour-wta' : 'tour-atp'}`}>
            {tour}
          </span>
          {match.tournament_name && (
            <span className="hero-tourn-title" title={match.tournament_name}>
              {match.tournament_name}
            </span>
          )}
          {match.surface && (
            <span className="hero-surface-pill">
              {getSurfaceEmoji(match.surface)} {match.surface}
            </span>
          )}
          {match.round_name && (
            <span className="hero-round-pill">{match.round_name}</span>
          )}
        </div>

        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="btn-share-match"
            title={t('matchHeader.shareTitle', 'Share Match Intelligence')}
          >
            <Share2 size={14} />
          </button>
        )}
      </div>

      {/* ── 2. Unified Tabular Scoreboard Body ── */}
      <div className="match-master-scoreboard-body">
        {/* Scoreboard Meta Header */}
        <div className="scoreboard-meta-line">
          <div className="scoreboard-time-chip">
            <Clock size={12} />
            <span>{formatMatchTime(match.match_date, selectedTimezone)}</span>
          </div>
          <MatchLiveStatus status={effectiveStatus} resultScore={match.result_score} />
        </div>

        {/* Players & Scores Table */}
        <div className="scoreboard-players-table">
          {/* Header Column Labels for Live Scores (SET, GM, PTS) */}
          {isLive && parsedScore && (
            <div className="scoreboard-table-header">
              <span className="th-label">{t('matchHeader.set', 'SET')}</span>
              <span className="th-label">{t('matchHeader.game', 'GM')}</span>
              <span className="th-label">{t('matchHeader.pts', 'PTS')}</span>
            </div>
          )}

          {/* Player 1 Row (Home) */}
          <div className={`scoreboard-player-row ${isHomeWinner ? 'row-winner-picked' : ''}`}>
            <div className="scoreboard-player-info">
              <PlayerAvatar
                name={match.home_name}
                imageUrl={getPlayerImageUrl(match.home_image, match.home_name, match.home_id)}
                size={32}
                isWinner={isHomeWinner}
              />
              <div className="scoreboard-player-details">
                <span className="scoreboard-player-name">
                  {match.home_name}
                </span>
                {isHomeWinner && (
                  <span className="scoreboard-pick-chip">
                    <Sparkles size={10} /> {t('matchHeader.aiPick', 'AI Pick')}
                  </span>
                )}
              </div>
            </div>

            <div className="scoreboard-player-aside">
              {match.home_odds && match.home_odds !== 'N/A' && (
                <span className={`scoreboard-odds-box ${isHomeWinner ? 'odds-picked-box' : ''}`}>
                  {match.home_odds}
                </span>
              )}

              {/* Live / Finished Scores */}
              {isLive && parsedScore ? (
                <div className="scoreboard-cells-stack">
                  <span className="sb-cell sb-set">{parsedScore.homeSets || '0'}</span>
                  <span className="sb-cell sb-game">{parsedScore.homeGames || '0'}</span>
                  <span className="sb-cell sb-point pts-glow">{parsedScore.homePoints || '0'}</span>
                </div>
              ) : isFinished && parsedScore && parsedScore.homeSets !== undefined ? (
                <div className="scoreboard-cells-stack">
                  <span className={`sb-cell sb-final-set ${Number(parsedScore.homeSets) > Number(parsedScore.awaySets) ? 'is-winner' : ''}`}>
                    {parsedScore.homeSets}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Player 2 Row (Away) */}
          <div className={`scoreboard-player-row ${isAwayWinner ? 'row-winner-picked' : ''}`}>
            <div className="scoreboard-player-info">
              <PlayerAvatar
                name={match.away_name}
                imageUrl={getPlayerImageUrl(match.away_image, match.away_name, match.away_id)}
                size={32}
                isWinner={isAwayWinner}
              />
              <div className="scoreboard-player-details">
                <span className="scoreboard-player-name">
                  {match.away_name}
                </span>
                {isAwayWinner && (
                  <span className="scoreboard-pick-chip">
                    <Sparkles size={10} /> {t('matchHeader.aiPick', 'AI Pick')}
                  </span>
                )}
              </div>
            </div>

            <div className="scoreboard-player-aside">
              {match.away_odds && match.away_odds !== 'N/A' && (
                <span className={`scoreboard-odds-box ${isAwayWinner ? 'odds-picked-box' : ''}`}>
                  {match.away_odds}
                </span>
              )}

              {/* Live / Finished Scores */}
              {isLive && parsedScore ? (
                <div className="scoreboard-cells-stack">
                  <span className="sb-cell sb-set">{parsedScore.awaySets || '0'}</span>
                  <span className="sb-cell sb-game">{parsedScore.awayGames || '0'}</span>
                  <span className="sb-cell sb-point pts-glow">{parsedScore.awayPoints || '0'}</span>
                </div>
              ) : isFinished && parsedScore && parsedScore.awaySets !== undefined ? (
                <div className="scoreboard-cells-stack">
                  <span className={`sb-cell sb-final-set ${Number(parsedScore.awaySets) > Number(parsedScore.homeSets) ? 'is-winner' : ''}`}>
                    {parsedScore.awaySets}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* ── Integrated Action Footer ── */}
        {(showWatch || showRegister) && (
          <div className="scoreboard-action-footer">
            {showWatch && (
              <button
                type="button"
                className="btn-scoreboard-watch"
                onClick={() => handlePartnerAction('watch_live')}
              >
                <Tv size={13} />
                <span>{t('matchHeader.watchLive', 'Watch Live Stream')}</span>
              </button>
            )}
            {showRegister && (
              <button
                type="button"
                className="btn-scoreboard-unlock"
                onClick={() => handlePartnerAction('registration')}
              >
                <Lock size={12} />
                <span>{t('matchHeader.unlockFullDossier', 'Unlock Full AI Dossier & Value Edge')}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── 3. Docked Sub-Navigation Tabs Strip (Flashscore / SofaScore style) ── */}
      {onTabChange && (
        <div className="match-master-docked-subtabs">
          <button
            type="button"
            className={`docked-subtab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => onTabChange('all')}
          >
            <Layers size={13} />
            <span>{t('matchHeader.subtabs.all', 'All Intel')}</span>
          </button>
          <button
            type="button"
            className={`docked-subtab-btn ${activeTab === 'tactical' ? 'active' : ''}`}
            onClick={() => onTabChange('tactical')}
          >
            <Sparkles size={13} />
            <span>{t('matchHeader.subtabs.tactical', 'AI Tactical')}</span>
          </button>
          <button
            type="button"
            className={`docked-subtab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => onTabChange('stats')}
          >
            <BarChart3 size={13} />
            <span>{t('matchHeader.subtabs.stats', 'Deep Stats')}</span>
          </button>
          <button
            type="button"
            className={`docked-subtab-btn ${activeTab === 'editorial' ? 'active' : ''}`}
            onClick={() => onTabChange('editorial')}
          >
            <Newspaper size={13} />
            <span>{t('matchHeader.subtabs.editorial', 'Editorial')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
