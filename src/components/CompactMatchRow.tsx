import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Flame, Shield, CheckCircle, XCircle, Clock, Lock, Key, Sparkles, Calendar } from 'lucide-react';
import type { Prediction } from '../types';
import { formatMatchTime, getCompactDateLabel, getSurfaceEmoji } from '../utils/formatters';

interface CompactMatchRowProps {
  prediction: Prediction;
  selectedTimezone: string;
  isLocked?: boolean;
  onUnlockClick?: () => void;
}

export const CompactMatchRow: React.FC<CompactMatchRowProps> = ({
  prediction,
  selectedTimezone,
  isLocked = false,
  onUnlockClick,
}) => {
  const [expanded, setExpanded] = useState(false);

  const triggerHaptic = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  const handleToggle = () => {
    triggerHaptic();
    setExpanded(prev => !prev);
  };

  const rawDateStr = prediction.match_date || prediction.published_at;
  const matchTimeStr = formatMatchTime(rawDateStr, selectedTimezone);
  const matchDateLabel = getCompactDateLabel(rawDateStr, selectedTimezone);

  const isHomeWinner = prediction.predicted_winner === prediction.home_name;
  const isAwayWinner = prediction.predicted_winner === prediction.away_name;

  const statusBadge = prediction.status === 'WON' ? (
    <span className="status-tag status-tag-won">WON {prediction.result_score || '2:1'}</span>
  ) : prediction.status === 'LOST' ? (
    <span className="status-tag status-tag-lost">LOST</span>
  ) : prediction.status === 'LIVE' ? (
    <span className="status-tag status-tag-live">● LIVE</span>
  ) : prediction.status === 'VOID' ? (
    <span className="status-tag status-tag-void">VOID</span>
  ) : (
    <span className="status-tag status-tag-time">{matchTimeStr}</span>
  );

  return (
    <div className={`compact-match-row glass ${expanded ? 'expanded' : ''}`}>
      {/* Clickable Summary Row */}
      <div className="compact-row-header" onClick={handleToggle}>
        {/* Date + Time / Status Column */}
        <div className="compact-time-col">
          {matchDateLabel && (
            <div className="compact-date-tiny">
              {matchDateLabel}
            </div>
          )}
          {statusBadge}
        </div>

        {/* Players & Odds Column */}
        <div className="compact-players-col">
          {/* Home Player */}
          <div className={`compact-player-line ${isHomeWinner ? 'predicted-winner' : ''}`}>
            <span className="player-name-text">{prediction.home_name}</span>
            {prediction.home_odds && <span className="player-odds-pill">{prediction.home_odds}</span>}
            {isHomeWinner && <span className="winner-dot" title="Predicted Winner">🎯</span>}
          </div>

          {/* Away Player */}
          <div className={`compact-player-line ${isAwayWinner ? 'predicted-winner' : ''}`}>
            <span className="player-name-text">{prediction.away_name}</span>
            {prediction.away_odds && <span className="player-odds-pill">{prediction.away_odds}</span>}
            {isAwayWinner && <span className="winner-dot" title="Predicted Winner">🎯</span>}
          </div>
        </div>

        {/* Value Bet & Win Prob Column */}
        <div className="compact-actions-col">
          {prediction.best_bet_selection ? (
            <div className="compact-bet-pill" title={prediction.best_bet_market}>
              <Flame size={12} color="#f97316" />
              <span>{prediction.best_bet_selection}</span>
            </div>
          ) : (
            <div className="compact-prob-badge">
              {prediction.win_probability || 65}%
            </div>
          )}

          <div className="compact-chevron">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {/* Expandable AI Breakdown Details */}
      {expanded && (
        <div className="compact-details-drawer">
          {isLocked ? (
            <div className="locked-box">
              <Lock size={24} color="var(--accent-amber)" />
              <div className="locked-title">🔒 FULL AI BREAKDOWN LOCKED</div>
              <p className="locked-desc">
                Register on our verified partner bookmaker to instantly unlock all Value Bets, Rationale & AI Scores!
              </p>
              <button onClick={onUnlockClick} className="btn-primary btn-unlock">
                <Key size={14} /> Register & Unlock Free VIP Access
              </button>
            </div>
          ) : (
            <div className="details-content">
              {/* Predicted Winner & Score Card */}
              <div className="details-prediction-card">
                <div className="details-card-top">
                  <span className="details-label">AI FINAL VERDICT</span>
                  <span className="details-prob">{prediction.win_probability || 65}% Confidence</span>
                </div>
                <div className="details-card-winner">
                  <span>🏆 {prediction.predicted_winner}</span>
                  {prediction.predicted_score && (
                    <span className="details-score-badge">{prediction.predicted_score}</span>
                  )}
                </div>
              </div>

              {/* Recommended Value Bet */}
              {prediction.best_bet_selection && (
                <div className="details-bet-card">
                  <div className="details-bet-header">
                    <span className="text-green font-bold">🔥 Recommended Value Bet</span>
                    {prediction.best_bet_ev && (
                      <span className="ev-badge">EV: {prediction.best_bet_ev}</span>
                    )}
                  </div>
                  <div className="details-bet-selection">{prediction.best_bet_selection}</div>
                  <div className="details-bet-market">Market: {prediction.best_bet_market || 'Match Winner'}</div>
                  {prediction.best_bet_rationale && (
                    <div className="details-bet-rationale">"{prediction.best_bet_rationale}"</div>
                  )}
                </div>
              )}

              {/* Option / Safe Bet */}
              {prediction.alt_bet_selection && (
                <div className="details-alt-card">
                  <div className="details-alt-title">
                    <Shield size={13} /> Alternative Option: {prediction.alt_bet_selection}
                  </div>
                  <div className="details-alt-market">Market: {prediction.alt_bet_market}</div>
                  {prediction.alt_bet_rationale && (
                    <div className="details-alt-desc">{prediction.alt_bet_rationale}</div>
                  )}
                </div>
              )}

              {/* AI Key Factors */}
              {prediction.key_factors && prediction.key_factors.length > 0 && (
                <div className="details-factors-box">
                  <div className="factors-title">⚡ Key Match Drivers:</div>
                  <ul className="factors-list">
                    {prediction.key_factors.map((factor, fIdx) => (
                      <li key={fIdx}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Summary */}
              {prediction.ai_summary && (
                <div className="details-summary-box">
                  <Sparkles size={14} color="var(--accent-cyan)" />
                  <div className="details-summary-text">{prediction.ai_summary}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
