import React from 'react';
import { ArrowLeft, Share2, Trophy, Clock } from 'lucide-react';
import type { Prediction } from '../../types';
import {
  formatMatchTime,
  formatPlayerDisplayName,
  getMatchGender,
  getSurfaceEmoji,
} from '../../utils/formatters';
import { MatchLiveStatus } from './MatchLiveStatus';

interface MatchHeaderProps {
  match: Prediction;
  selectedTimezone: string;
  onBack: () => void;
  onShare?: () => void;
}

export const MatchHeader: React.FC<MatchHeaderProps> = ({
  match,
  selectedTimezone,
  onBack,
  onShare,
}) => {
  const gender = getMatchGender(
    match.tournament_name,
    match.round_name,
    `${match.home_name} vs ${match.away_name}`,
    match.home_name,
    match.away_name
  );
  const isWomen = gender === 'women';
  const tour = isWomen ? 'WTA' : 'ATP';

  const isHomeWinner = match.predicted_winner === match.home_name;
  const isAwayWinner = match.predicted_winner === match.away_name;

  const rawScore = (match.result_score || '').trim();
  const compactScore = rawScore ? rawScore.split('(')[0].trim() : '';

  return (
    <div className="match-card-header-hero">
      {/* ── Top Navigation Bar ── */}
      <div className="match-hero-nav-bar">
        <button
          type="button"
          onClick={onBack}
          className="btn-back-to-matches"
          title="Back to matches list"
        >
          <ArrowLeft size={16} />
          <span>All Matches</span>
        </button>

        <div className="match-hero-meta-capsule">
          <span className={`hero-tour-pill ${isWomen ? 'tour-wta' : 'tour-atp'}`}>
            {tour}
          </span>
          <span className="hero-tourn-name">
            <Trophy size={12} className="hero-trophy-icon" />
            {match.tournament_name || 'Tennis Tour'}
          </span>
          {match.round_name && (
            <span className="hero-round-name">• {match.round_name}</span>
          )}
          <span className="hero-surface-tag">
            {getSurfaceEmoji(match.surface)} {match.surface || 'Hard'}
          </span>
        </div>

        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="btn-share-match"
            title="Share match link"
          >
            <Share2 size={14} />
            <span className="hide-on-mobile">Share</span>
          </button>
        )}
      </div>

      {/* ── Scoreboard Arena Card ── */}
      <div className={`match-scoreboard-arena ${isWomen ? 'arena-wta' : 'arena-atp'}`}>
        {/* Arena Top Line: Live / Scheduled status */}
        <div className="arena-top-status-row">
          <div className="arena-match-time">
            <Clock size={12} />
            <span>{formatMatchTime(match.match_date, selectedTimezone)}</span>
          </div>
          <MatchLiveStatus status={match.status} resultScore={match.result_score} />
        </div>

        {/* Arena Players & Center Score */}
        <div className="arena-players-grid">
          {/* Home Player */}
          <div className={`arena-player-card home-player ${isHomeWinner ? 'is-favored' : ''}`}>
            <div className="arena-player-name">
              {formatPlayerDisplayName(match.home_name)}
            </div>
            <div className="arena-player-sub">
              {match.home_odds && match.home_odds !== 'N/A' && (
                <span className="arena-odds-badge">@{match.home_odds}</span>
              )}
              {isHomeWinner && (
                <span className="arena-lean-chip">✓ MODEL LEAN</span>
              )}
            </div>
          </div>

          {/* Center Score / VS Box */}
          <div className="arena-center-nexus">
            {compactScore ? (
              <div className="arena-score-display">
                <span className="score-main-text">{compactScore}</span>
                <span className="score-sub-label">SET SCORE</span>
              </div>
            ) : (
              <div className="arena-vs-badge">
                <span>VS</span>
              </div>
            )}
          </div>

          {/* Away Player */}
          <div className={`arena-player-card away-player ${isAwayWinner ? 'is-favored' : ''}`}>
            <div className="arena-player-name">
              {formatPlayerDisplayName(match.away_name)}
            </div>
            <div className="arena-player-sub">
              {isAwayWinner && (
                <span className="arena-lean-chip">✓ MODEL LEAN</span>
              )}
              {match.away_odds && match.away_odds !== 'N/A' && (
                <span className="arena-odds-badge">@{match.away_odds}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
