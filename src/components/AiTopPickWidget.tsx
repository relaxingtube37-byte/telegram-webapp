import React, { useMemo } from 'react';
import { Sparkles, Trophy, Lock, Key, ArrowRight, Zap } from 'lucide-react';
import type { Prediction } from '../types';
import { formatPlayerDisplayName, getSurfaceEmoji, getMatchGender } from '../utils/formatters';

interface AiTopPickWidgetProps {
  predictions: Prediction[];
  onSelectMatch: (pred: Prediction) => void;
  isVerified: boolean;
  onUnlockClick: () => void;
}

export const AiTopPickWidget: React.FC<AiTopPickWidgetProps> = ({
  predictions,
  onSelectMatch,
  isVerified,
  onUnlockClick,
}) => {
  // Dynamically select the single top pick with the highest confidence / win probability from active predictions
  const topPick = useMemo(() => {
    const active = predictions.filter(p => p.status === 'UPCOMING' || p.status === 'LIVE');
    if (active.length === 0) return null;

    // Prioritize HIGH confidence first, then highest win probability
    const sorted = [...active].sort((a, b) => {
      const confWeight = (c?: string) => (c === 'HIGH' ? 3 : c === 'MODERATE' ? 2 : 1);
      const diffConf = confWeight(b.confidence) - confWeight(a.confidence);
      if (diffConf !== 0) return diffConf;

      const probA = a.win_probability || 50;
      const probB = b.win_probability || 50;
      return probB - probA;
    });

    return sorted[0];
  }, [predictions]);

  if (!topPick) {
    return (
      <div className="top-pick-widget empty-pick">
        <div className="top-pick-header">
          <Sparkles size={14} color="#d4a843" />
          <span>TOP AI VALUE PICK</span>
        </div>
        <p className="top-pick-empty-text">
          Our machine learning models are analyzing upcoming ATP &amp; WTA fixtures. Check back soon for the next high-EV pick.
        </p>
      </div>
    );
  }

  const gender = getMatchGender(
    topPick.tournament_name,
    topPick.round_name,
    `${topPick.home_name} vs ${topPick.away_name}`,
    topPick.home_name,
    topPick.away_name
  );
  const isWta = gender === 'women';
  const winProb = Math.round(topPick.win_probability || 68);

  return (
    <div className="top-pick-widget">
      <div className="top-pick-badge-top">
        <div className="top-pick-title-left">
          <Zap size={14} color="#e8c060" />
          <span>FEATURED AI PICK</span>
        </div>
        <span className={`tour-pill ${isWta ? 'tour-pill-wta' : 'tour-pill-atp'}`}>
          {isWta ? 'WTA' : 'ATP'}
        </span>
      </div>

      {/* Tournament info */}
      <div className="top-pick-meta">
        <span className="top-pick-tourn">
          {getSurfaceEmoji(topPick.surface)} {topPick.tournament_name?.split(',')[0]}
        </span>
        {topPick.status === 'LIVE' && (
          <span className="top-pick-live-tag">LIVE</span>
        )}
      </div>

      {/* Matchup Players */}
      <div className="top-pick-matchup">
        <div className="top-pick-player">
          <span className="player-name">{formatPlayerDisplayName(topPick.home_name)}</span>
          {topPick.predicted_winner?.toLowerCase().includes(topPick.home_name?.toLowerCase() || '') && (
            <span className="pick-marker">PICK</span>
          )}
        </div>
        <div className="top-pick-vs">vs</div>
        <div className="top-pick-player">
          <span className="player-name">{formatPlayerDisplayName(topPick.away_name)}</span>
          {topPick.predicted_winner?.toLowerCase().includes(topPick.away_name?.toLowerCase() || '') && (
            <span className="pick-marker">PICK</span>
          )}
        </div>
      </div>

      {/* Probability Gauge */}
      <div className="top-pick-gauge-box">
        <div className="gauge-header">
          <span className="gauge-label">AI Win Probability</span>
          <span className="gauge-val">{winProb}%</span>
        </div>
        <div className="gauge-track">
          <div className="gauge-fill" style={{ width: `${Math.max(winProb, 20)}%` }} />
        </div>
      </div>

      {/* Market recommendation */}
      {topPick.best_bet_market && topPick.best_bet_market !== 'NO_BET' && (
        <div className="top-pick-market">
          <span className="market-label">Recommended Market:</span>
          <span className="market-value">{topPick.best_bet_market}</span>
        </div>
      )}

      {/* Action Button */}
      {!isVerified ? (
        <button
          onClick={onUnlockClick}
          className="top-pick-action-btn btn-unlock-pick pulse-glow"
        >
          <Lock size={13} /> Unlock Full Tactical Dossier
        </button>
      ) : (
        <button
          onClick={() => onSelectMatch(topPick)}
          className="top-pick-action-btn btn-view-pick"
        >
          <span>View Deep Match Dossier</span>
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
};
