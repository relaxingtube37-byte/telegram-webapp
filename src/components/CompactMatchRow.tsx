import React from 'react';
import type { ContentLayerFlags, Prediction, ReferralSite } from '../types';
import {
  Clock, CheckCircle2, XCircle, ChevronRight,
  Tv, Sparkles, Lock, Trophy
} from 'lucide-react';
import {
  formatMatchTime,
  getCompactDateLabel,
  getSurfaceEmoji,
  formatPlayerDisplayName,
  getMatchGender,
  parseTennisScore
} from '../utils/formatters';
import { buildPartnerWatchUrl, openExternalLink, shouldShowWatchLive } from '../utils/referralLinks';
import { PlayerAvatar } from './PlayerAvatar';
import { getPlayerImageUrl } from '../utils/playerImage';

export interface CompactMatchRowProps {
  prediction: Prediction;
  selectedTimezone: string;
  isLocked?: boolean;
  isSelected?: boolean;
  onUnlockClick?: () => void;
  onOpenMatchPage?: (prediction: Prediction) => void;
  apiBase?: string;
  referralSites?: ReferralSite[];
  trackingId?: string | number;
  contentLayers?: ContentLayerFlags;
  canWatchLive?: boolean;
}

export const CompactMatchRow: React.FC<CompactMatchRowProps> = ({
  prediction,
  selectedTimezone,
  isLocked = false,
  isSelected = false,
  onUnlockClick,
  onOpenMatchPage,
  apiBase = '',
  referralSites = [],
  trackingId = 'anonymous',
  canWatchLive = true,
}) => {
  const matchGender = getMatchGender(
    prediction.tournament_name,
    prediction.round_name,
    `${prediction.home_name} vs ${prediction.away_name}`,
    prediction.home_name,
    prediction.away_name
  );
  const isWomen = matchGender === 'women';

  const triggerHaptic = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  const handleClick = () => {
    triggerHaptic();
    onOpenMatchPage?.(prediction);
  };

  const rawDateStr = prediction.match_date || prediction.published_at;
  const matchTimeStr = formatMatchTime(rawDateStr, selectedTimezone);
  const matchDateLabel = getCompactDateLabel(rawDateStr, selectedTimezone);

  const isHomeWinner = prediction.predicted_winner === prediction.home_name;
  const isAwayWinner = prediction.predicted_winner === prediction.away_name;
  const winProb = prediction.win_probability || 65;

  const rawScore = (prediction.result_score || '').trim();
  const parsedScore = parseTennisScore(prediction.result_score, prediction.status);

  const homeAvatarUrl = getPlayerImageUrl(prediction.home_image, prediction.home_name, prediction.home_id, apiBase);
  const awayAvatarUrl = getPlayerImageUrl(prediction.away_image, prediction.away_name, prediction.away_id, apiBase);

  // Status Badge
  const renderStatus = () => {
    if (prediction.status === 'WON') {
      const displayScore = parsedScore?.setsScore || '2-0';
      return (
        <span className="tennis-status-badge badge-won">
          <CheckCircle2 size={11} />
          <span>WON {displayScore}</span>
        </span>
      );
    }
    if (prediction.status === 'LOST') {
      const displayScore = parsedScore?.setsScore || '0-2';
      return (
        <span className="tennis-status-badge badge-lost">
          <XCircle size={11} />
          <span>LOST {displayScore}</span>
        </span>
      );
    }
    if (prediction.status === 'LIVE') {
      return (
        <div className="live-status-badge-wrap">
          <span className="tennis-status-badge badge-live">
            <span className="live-dot-pulse" />
            <span>LIVE</span>
          </span>
          {parsedScore?.summaryText && (
            <div className="live-score-summary-bar" title="Sets | Points | Games">
              {parsedScore.summaryText}
            </div>
          )}
        </div>
      );
    }
    if (prediction.status === 'VOID') {
      return <span className="tennis-status-badge badge-void">VOID</span>;
    }
    return (
      <span className="tennis-status-badge badge-upcoming">
        <Clock size={11} />
        <span className="match-time-text">{matchTimeStr}</span>
        <span className="match-day-sub">{matchDateLabel}</span>
      </span>
    );
  };

  const showWatch = canWatchLive && shouldShowWatchLive(prediction.status, rawDateStr);
  const isFinished = prediction.status === 'WON' || prediction.status === 'LOST';
  const isLive = prediction.status === 'LIVE';

  return (
    <div
      className={`tennis-match-row ${isWomen ? 'match-row-wta' : 'match-row-atp'} ${isSelected ? 'row-active-selected' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Open match ${prediction.home_name} vs ${prediction.away_name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* ── Column 1: Time / Status ── */}
      <div className="match-col-status">
        {renderStatus()}
        {prediction.round_name && (
          <span className="match-round-tag">{prediction.round_name}</span>
        )}
      </div>

      {/* ── Column 2: Players ── */}
      <div className="match-col-players">
        {/* Home Player */}
        <div className={`player-row ${isHomeWinner ? 'player-is-winner' : ''}`}>
          <div className="player-info">
            <PlayerAvatar
              name={prediction.home_name}
              imageUrl={homeAvatarUrl}
              size={22}
              isWinner={isHomeWinner}
            />
            <span className="player-name-text">
              {formatPlayerDisplayName(prediction.home_name)}
            </span>
            {isHomeWinner && (
              <span className="lean-badge-pill" title="Model Lean">
                ✓ LEAN
              </span>
            )}
          </div>

          <div className="player-row-right">
            {/* Live Scores: Sets | Points | Games */}
            {isLive && parsedScore && (
              <div className="player-live-metric-row">
                <span className="metric-chip chip-sets" title="Sets Won">{parsedScore.homeSets ?? '0'}</span>
                <span className="metric-chip chip-points" title="Game Points">{parsedScore.homePoints ?? '0'}</span>
                <span className="metric-chip chip-games" title="Current Set Games">{parsedScore.homeGames ?? '0'}</span>
              </div>
            )}

            {/* Finished Match: Sets Won Only (e.g. 2, 0) */}
            {isFinished && parsedScore && (
              <div className="player-final-set-wrap" title="Final Sets Won">
                <span className={`final-set-cell ${Number(parsedScore.homeSets) > Number(parsedScore.awaySets) ? 'is-set-winner' : ''}`}>
                  {parsedScore.homeSets}
                </span>
              </div>
            )}

            {prediction.home_odds && prediction.home_odds !== 'N/A' && (
              <span className="player-odds-tag">@{prediction.home_odds}</span>
            )}
          </div>
        </div>

        {/* Away Player */}
        <div className={`player-row ${isAwayWinner ? 'player-is-winner' : ''}`}>
          <div className="player-info">
            <PlayerAvatar
              name={prediction.away_name}
              imageUrl={awayAvatarUrl}
              size={22}
              isWinner={isAwayWinner}
            />
            <span className="player-name-text">
              {formatPlayerDisplayName(prediction.away_name)}
            </span>
            {isAwayWinner && (
              <span className="lean-badge-pill" title="Model Lean">
                ✓ LEAN
              </span>
            )}
          </div>

          <div className="player-row-right">
            {/* Live Scores: Sets | Points | Games */}
            {isLive && parsedScore && (
              <div className="player-live-metric-row">
                <span className="metric-chip chip-sets" title="Sets Won">{parsedScore.awaySets ?? '0'}</span>
                <span className="metric-chip chip-points" title="Game Points">{parsedScore.awayPoints ?? '0'}</span>
                <span className="metric-chip chip-games" title="Current Set Games">{parsedScore.awayGames ?? '0'}</span>
              </div>
            )}

            {/* Finished Match: Sets Won Only (e.g. 2, 0) */}
            {isFinished && parsedScore && (
              <div className="player-final-set-wrap" title="Final Sets Won">
                <span className={`final-set-cell ${Number(parsedScore.awaySets) > Number(parsedScore.homeSets) ? 'is-set-winner' : ''}`}>
                  {parsedScore.awaySets}
                </span>
              </div>
            )}

            {prediction.away_odds && prediction.away_odds !== 'N/A' && (
              <span className="player-odds-tag">@{prediction.away_odds}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Column 3: AI Prediction & Win Probability ── */}
      <div className="match-col-ai">
        <div className="ai-pred-headline">
          <span className="ai-pred-label">
            <Sparkles size={11} className="ai-sparkle-icon" /> AI Forecast
          </span>
          <span className="ai-prob-pct">{winProb}%</span>
        </div>

        {/* Dual Progress Bar */}
        <div className="ai-prob-track">
          <div
            className="ai-prob-fill"
            style={{ width: `${Math.min(Math.max(winProb, 10), 96)}%` }}
          />
        </div>

        <div className="ai-meta-subrow">
          <span className="ai-winner-name truncate-text">
            {prediction.predicted_winner ? formatPlayerDisplayName(prediction.predicted_winner) : 'Pick'}
          </span>
          {prediction.confidence && (
            <span className="ai-conf-chip">★ {prediction.confidence}</span>
          )}
        </div>
      </div>

      {/* ── Column 4: Quick Action & Arrow ── */}
      <div className="match-col-action">
        {showWatch && (
          <button
            type="button"
            className="btn-watch-live-mini"
            title="Watch Live Stream"
            onClick={(e) => {
              e.stopPropagation();
              const url = buildPartnerWatchUrl({ apiBase, sites: referralSites, trackingId });
              if (url) openExternalLink(url);
              else onUnlockClick?.();
            }}
          >
            <Tv size={11} />
            <span className="hide-on-mobile">Live</span>
          </button>
        )}

        {isLocked && (
          <span className="row-locked-icon" title="Full Analysis Gated">
            <Lock size={12} />
          </span>
        )}

        <div className="row-open-cta" title="Open Full Match Intelligence">
          <ChevronRight size={18} className="chevron-open-icon" />
        </div>
      </div>
    </div>
  );
};
