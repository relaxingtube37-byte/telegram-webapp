import React from 'react';
import { ArrowLeft, Share2, Trophy, Clock } from 'lucide-react';
import type { Prediction } from '../../types';
import {
  formatMatchTime,
  formatPlayerDisplayName,
  getMatchGender,
  getSurfaceEmoji,
  parseTennisScore,
} from '../../utils/formatters';
import { MatchLiveStatus } from './MatchLiveStatus';
import { PlayerAvatar } from '../PlayerAvatar';
import { getPlayerImageUrl } from '../../utils/playerImage';

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

  const parsedScore = parseTennisScore(match.result_score, match.status);
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'WON' || match.status === 'LOST';

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
            title="Share Match Intelligence"
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
            <PlayerAvatar
              name={match.home_name}
              imageUrl={getPlayerImageUrl(match.home_image, match.home_name, match.home_id)}
              size={42}
              isWinner={isHomeWinner}
              className="arena-player-avatar"
            />
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
            {isLive && parsedScore ? (
              <div className="arena-live-scoreboard">
                <div className="arena-live-tag-mini">
                  <span className="live-dot-pulse" />
                  <span>LIVE</span>
                </div>
                <div className="arena-vertical-score-stack">
                  <div className="vertical-score-row sets-row" title="Sets Won">
                    <span className="v-label">SETS</span>
                    <span className="v-num">{parsedScore.liveSets || '0-0'}</span>
                  </div>
                  <div className="vertical-score-row points-row" title="Game Points">
                    <span className="v-label">POINTS</span>
                    <span className="v-num pts-glow">{parsedScore.livePoints || '0-0'}</span>
                  </div>
                  <div className="vertical-score-row games-row" title="Current Set Games">
                    <span className="v-label">GAMES</span>
                    <span className="v-num">{parsedScore.liveGames || '0-0'}</span>
                  </div>
                </div>
              </div>
            ) : isFinished && parsedScore ? (
              <div className="arena-score-display">
                <span className="score-main-text">{parsedScore.setsScore}</span>
                <span className="score-sub-label">FINAL SETS</span>
              </div>
            ) : (
              <div className="arena-vs-badge">
                <span>VS</span>
              </div>
            )}
          </div>

          {/* Away Player */}
          <div className={`arena-player-card away-player ${isAwayWinner ? 'is-favored' : ''}`}>
            <PlayerAvatar
              name={match.away_name}
              imageUrl={getPlayerImageUrl(match.away_image, match.away_name, match.away_id)}
              size={42}
              isWinner={isAwayWinner}
              className="arena-player-avatar"
            />
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
