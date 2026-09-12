import React from 'react';
import { Sparkles, Target, Shield, CheckCircle2 } from 'lucide-react';
import type { Prediction } from '../../types';
import { formatPlayerDisplayName } from '../../utils/formatters';

interface MatchPredictionPanelProps {
  match: Prediction;
}

export const MatchPredictionPanel: React.FC<MatchPredictionPanelProps> = ({ match }) => {
  const winProb = match.win_probability ?? 0;
  const rawWinner = (match.predicted_winner || '').trim();
  const winner = rawWinner.toLowerCase();
  const home = (match.home_name || '').trim().toLowerCase();
  const away = (match.away_name || '').trim().toLowerCase();

  const isNeutralOrNoBet =
    winner.includes(' vs ') ||
    winner.includes(' v ') ||
    winner.includes('no_bet') ||
    winner.includes('pass') ||
    winProb === 50;

  const rawHomeLean = !isNeutralOrNoBet && Boolean(winner && home && (winner === home || winner.includes(home)));
  const rawAwayLean = !isNeutralOrNoBet && Boolean(winner && away && (winner === away || winner.includes(away)));
  const homeLean = rawHomeLean && !rawAwayLean;
  const awayLean = rawAwayLean && !rawHomeLean;

  const displayedWinnerName = isNeutralOrNoBet
    ? 'Neutral / Model Pass'
    : formatPlayerDisplayName(match.predicted_winner);

  const favoredOdds = homeLean ? match.home_odds : awayLean ? match.away_odds : null;

  return (
    <div className="ai-verdict-card">
      {/* Top Header Row */}
      <div className="ai-verdict-header">
        <div className="ai-verdict-title">
          <Sparkles size={14} className="ai-sparkle-cyan" />
          <span>AI Model Verdict</span>
        </div>
        {match.confidence && (
          <span className={`ai-confidence-pill conf-${match.confidence.toLowerCase()}`}>
            {match.confidence} CONFIDENCE
          </span>
        )}
      </div>

      {/* Hero Winner & Probability Display */}
      <div className="ai-verdict-main">
        <div className="ai-winner-focus">
          <span className="ai-winner-caption">Projected Winner</span>
          <div className="ai-winner-display">
            {!isNeutralOrNoBet && <CheckCircle2 size={16} className="text-green-accent" />}
            <span className="ai-winner-name">{displayedWinnerName}</span>
            {favoredOdds && favoredOdds !== 'N/A' && (
              <span className="ai-winner-odds">@{favoredOdds}</span>
            )}
          </div>
        </div>
        <div className="ai-prob-number-wrap">
          <span className="ai-prob-val">{isNeutralOrNoBet ? '50%' : `${winProb}%`}</span>
          <span className="ai-prob-caption">Win Probability</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="ai-verdict-bar-track">
        <div
          className="ai-verdict-bar-fill"
          style={{ width: `${Math.min(Math.max(isNeutralOrNoBet ? 50 : winProb, 10), 96)}%` }}
        />
      </div>

      {/* Quick Metrics Bar */}
      <div className="ai-verdict-metrics-row">
        {match.predicted_score && (
          <div className="ai-metric-pill">
            <Target size={12} className="metric-icon" />
            <span className="metric-label">Score:</span>
            <strong className="metric-val">{match.predicted_score}</strong>
          </div>
        )}
        <div className="ai-metric-pill">
          <Shield size={12} className="metric-icon" />
          <span className="metric-label">Action:</span>
          <strong className="metric-val">
            {isNeutralOrNoBet ? 'Pass / Hold' : 'High Edge'}
          </strong>
        </div>
      </div>
    </div>
  );
};
