import React, { useState } from 'react';
import type { Prediction } from '../types';
import { 
  ChevronDown, ChevronUp, Trophy, Flame, Shield, 
  AlertTriangle, Key, Lock, Sparkles, TrendingUp,
  Percent, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { formatMatchTime, getCompactDateLabel, getSurfaceEmoji } from '../utils/formatters';


const getPlayerAvatarUrl = (img?: string, id?: number, name?: string) => {
  if (img && (img.startsWith('data:image') || img.startsWith('http://') || img.startsWith('https://'))) {
    return img;
  }
  if (id) {
    return `https://telegram-backend-2yck.onrender.com/api/images/player/${id}?name=${encodeURIComponent(name || '')}`;
  }
  return null;
};

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

  const homeAvatarUrl = getPlayerAvatarUrl(prediction.home_image, prediction.home_id, prediction.home_name);
  const awayAvatarUrl = getPlayerAvatarUrl(prediction.away_image, prediction.away_id, prediction.away_name);

  const homeInitials = (prediction.home_name || '').split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const awayInitials = (prediction.away_name || '').split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

  const winProb = prediction.win_probability || 65;

  const statusBadge = prediction.status === 'WON' ? (
    <span className="status-tag status-tag-won">
      <CheckCircle2 size={11} /> WON {prediction.result_score || '2:1'}
    </span>
  ) : prediction.status === 'LOST' ? (
    <span className="status-tag status-tag-lost">
      <XCircle size={11} /> LOST
    </span>
  ) : prediction.status === 'LIVE' ? (
    <span className="status-tag status-tag-live">
      <span className="live-pulse-dot" /> LIVE
    </span>
  ) : prediction.status === 'VOID' ? (
    <span className="status-tag status-tag-void">VOID</span>
  ) : (
    <span className="status-tag status-tag-time">
      <Clock size={11} /> {matchTimeStr}
    </span>
  );

  return (
    <div className={`compact-match-row glass ${expanded ? 'expanded' : ''}`}>
      {/* Clickable Header Row (Tier 1: High-Affordance Glanceable Info) */}
      <div 
        className="compact-row-header" 
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
      >
        {/* Time / Status Column */}
        <div className="compact-time-col">
          {matchDateLabel && (
            <div className="compact-date-tiny">
              {matchDateLabel}
            </div>
          )}
          {statusBadge}
        </div>

        {/* Players & Odds Column (Center Stage) */}
        <div className="compact-players-col">
          {/* Tournament & Surface Tag */}
          <div className="compact-tourn-tag">
            <span className="surface-pill">{getSurfaceEmoji(prediction.surface)} {prediction.surface || 'Hard'}</span>
            {prediction.tournament_name && <span className="tourn-name-text"> · {prediction.tournament_name}</span>}
            {prediction.round_name && <span className="text-secondary"> ({prediction.round_name})</span>}
          </div>

          {/* Home Player */}
          <div className={`compact-player-line ${isHomeWinner ? 'predicted-winner' : ''}`}>
            <div className="player-avatar-wrapper">
              {homeAvatarUrl && (
                <img
                  src={homeAvatarUrl}
                  alt={prediction.home_name}
                  className="player-avatar-img"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              )}
              <span className="player-avatar-fallback" style={{ display: homeAvatarUrl ? 'none' : 'flex' }}>
                {homeInitials || '🎾'}
              </span>
            </div>
            <span className="player-name-text">{prediction.home_name}</span>
            {prediction.home_odds && <span className="player-odds-pill">{prediction.home_odds}</span>}
            {isHomeWinner && <span className="winner-dot" title="Predicted Winner">🎯</span>}
          </div>

          {/* Away Player */}
          <div className={`compact-player-line ${isAwayWinner ? 'predicted-winner' : ''}`}>
            <div className="player-avatar-wrapper">
              {awayAvatarUrl && (
                <img
                  src={awayAvatarUrl}
                  alt={prediction.away_name}
                  className="player-avatar-img"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              )}
              <span className="player-avatar-fallback" style={{ display: awayAvatarUrl ? 'none' : 'flex' }}>
                {awayInitials || '🎾'}
              </span>
            </div>
            <span className="player-name-text">{prediction.away_name}</span>
            {prediction.away_odds && <span className="player-odds-pill">{prediction.away_odds}</span>}
            {isAwayWinner && <span className="winner-dot" title="Predicted Winner">🎯</span>}
          </div>
        </div>

        {/* Value Bet Pill / Win Prob & Chevron (Affordance Indicator) */}
        <div className="compact-actions-col">
          {prediction.best_bet_selection ? (
            <div className="compact-bet-pill" title={prediction.best_bet_market}>
              <Flame size={12} color="#f97316" className="pulse-icon" />
              <span>{prediction.best_bet_selection}</span>
            </div>
          ) : (
            <div className="compact-prob-badge">
              {winProb}%
            </div>
          )}

          <div className="compact-chevron">
            {expanded ? <ChevronUp size={16} color="#38bdf8" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
          </div>
        </div>
      </div>

      {/* Expandable Intelligence Drawer (Tier 2 & 3: Progressive Disclosure) */}
      {expanded && (
        <div className="compact-details-drawer">
          {isLocked ? (
            <div className="locked-box">
              <Lock size={26} color="var(--accent-amber)" />
              <div className="locked-title">🔒 FULL AI INTELLIGENCE LOCKED</div>
              <p className="locked-desc">
                Register on our verified partner bookmaker to instantly unlock all VIP Value Bets, In-Depth Rationales & Real-Time Probability Matrices!
              </p>
              <button onClick={onUnlockClick} className="btn-primary btn-unlock">
                <Key size={14} /> Register & Unlock Free VIP Access
              </button>
            </div>
          ) : (
            <div className="details-content">
              {/* 🏆 Tier 2: AI Verdict & Confidence Progress */}
              <div className="details-prediction-card">
                <div className="details-card-top">
                  <span className="details-label">
                    <Trophy size={13} color="#38bdf8" /> AI MATCH WINNER VERDICT
                  </span>
                  <span className="details-prob">{winProb}% Win Probability</span>
                </div>
                <div className="details-card-winner">
                  <span className="winner-title-text">{prediction.predicted_winner}</span>
                  {prediction.predicted_score && (
                    <span className="details-score-badge">Score: {prediction.predicted_score}</span>
                  )}
                </div>
                {/* Confidence Bar Meter */}
                <div className="confidence-bar-track">
                  <div 
                    className="confidence-bar-fill"
                    style={{ width: `${Math.min(Math.max(winProb, 15), 100)}%` }}
                  />
                </div>
              </div>

              {/* 🔥 Tier 2: Recommended Value Bet (+EV) */}
              {prediction.best_bet_selection && (
                <div className="details-bet-card">
                  <div className="details-bet-header">
                    <span className="text-green font-bold flex items-center gap-1">
                      <Flame size={14} color="#22c55e" /> Recommended Value Bet
                    </span>
                    {prediction.best_bet_ev && (
                      <span className="ev-badge">EV: {prediction.best_bet_ev}</span>
                    )}
                  </div>
                  <div className="details-bet-selection">{prediction.best_bet_selection}</div>
                  <div className="details-bet-market">
                    Market: <strong>{prediction.best_bet_market || 'Match Winner'}</strong>
                  </div>
                  {prediction.best_bet_rationale && (
                    <div className="details-bet-rationale">"{prediction.best_bet_rationale}"</div>
                  )}
                </div>
              )}

              {/* 🛡️ Tier 3: Secondary Hedge / Alternative Option */}
              {prediction.alt_bet_selection && (
                <div className="details-alt-card">
                  <div className="details-alt-title">
                    <Shield size={13} color="#38bdf8" /> Secondary Hedge: <strong>{prediction.alt_bet_selection}</strong>
                  </div>
                  <div className="details-alt-market">Market: {prediction.alt_bet_market}</div>
                  {prediction.alt_bet_rationale && (
                    <div className="details-alt-desc">{prediction.alt_bet_rationale}</div>
                  )}
                </div>
              )}

              {/* ⚡ Tier 3: 3 Key Analytical Drivers */}
              {prediction.key_factors && prediction.key_factors.length > 0 && (
                <div className="details-factors-box">
                  <div className="factors-title">
                    <Sparkles size={13} color="#fbbf24" /> Key Match Analytics:
                  </div>
                  <ul className="factors-list">
                    {prediction.key_factors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ⚠️ Tier 3: Devil's Advocate / Contrarian Upset Risk */}
              {prediction.devils_advocate_risk && (
                <div className="details-risk-box">
                  <div className="risk-title">
                    <AlertTriangle size={13} color="#f43f5e" /> Upset Risk & Counter-Scenario:
                  </div>
                  <div className="risk-desc">{prediction.devils_advocate_risk}</div>
                </div>
              )}

              {/* 📝 Executive Preview Summary */}
              {prediction.ai_summary && (
                <div className="details-summary-box">
                  <p className="details-summary-text">{prediction.ai_summary}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
