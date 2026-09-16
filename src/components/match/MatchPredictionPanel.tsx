import React from 'react';
import { Sparkles, Target, Shield, CheckCircle2, Lock } from 'lucide-react';
import type { Prediction } from '../../types';
import { formatPlayerDisplayName } from '../../utils/formatters';
import { useTranslation } from '../../i18n';

interface MatchPredictionPanelProps {
  match: Prediction;
  onUnlockClick?: () => void;
}

export const MatchPredictionPanel: React.FC<MatchPredictionPanelProps> = ({ match, onUnlockClick }) => {
  const { t } = useTranslation();
  const isLocked = match.content_locked === true || !match.predicted_winner || match.predicted_winner === 'LOCKED';

  if (isLocked) {
    return (
      <div className="ai-verdict-card ai-verdict-locked" style={{ border: '1px dashed rgba(212, 168, 67, 0.45)', background: 'rgba(15, 25, 20, 0.85)' }}>
        <div className="ai-verdict-header">
          <div className="ai-verdict-title">
            <Lock size={14} color="#fbbf24" />
            <span style={{ color: '#fbbf24' }}>{t('predictionPanel.verdictGated', 'AI Model Verdict (Gated)')}</span>
          </div>
          <span className="ai-confidence-pill conf-low" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
            {t('predictionPanel.unlockRequired', '2-Step Unlock Required')}
          </span>
        </div>

        <div style={{ textAlign: 'center', padding: '1.25rem 1rem' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f4f4f5', marginBottom: '0.35rem' }}>
            🔒 {t('predictionPanel.gatedHeadline', 'Projected Winner & Win Probability Hidden')}
          </div>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            {t('predictionPanel.gatedDesc', 'Specialist model verdict, projected match winner, edge ratings, and expected set scores require verified membership.')}
          </p>
          <button
            type="button"
            className="pulse-glow"
            onClick={onUnlockClick}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
            }}
          >
            <Lock size={14} /> {t('predictionPanel.unlockBtn', 'Complete 2-Step Registration to Unlock')}
          </button>
        </div>
      </div>
    );
  }

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
    ? t('predictionPanel.neutralModelPass', 'Neutral / Model Pass')
    : formatPlayerDisplayName(match.predicted_winner);

  const favoredOdds = homeLean ? match.home_odds : awayLean ? match.away_odds : null;

  return (
    <div className="ai-verdict-card">
      {/* Top Header Row */}
      <div className="ai-verdict-header">
        <div className="ai-verdict-title">
          <Sparkles size={14} className="ai-sparkle-cyan" />
          <span>{t('predictionPanel.verdictTitle', 'AI Model Verdict')}</span>
        </div>
        {match.confidence && (
          <span className={`ai-confidence-pill conf-${match.confidence.toLowerCase()}`}>
            {match.confidence} {t('predictionPanel.confidence', 'CONFIDENCE')}
          </span>
        )}
      </div>

      {/* Hero Winner & Probability Display */}
      <div className="ai-verdict-main">
        <div className="ai-winner-focus">
          <span className="ai-winner-caption">{t('predictionPanel.projectedWinner', 'Projected Winner')}</span>
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
          <span className="ai-prob-caption">{t('predictionPanel.winProbability', 'Win Probability')}</span>
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
            <span className="metric-label">{t('predictionPanel.score', 'Score:')}</span>
            <strong className="metric-val">{match.predicted_score}</strong>
          </div>
        )}
        <div className="ai-metric-pill">
          <Shield size={12} className="metric-icon" />
          <span className="metric-label">{t('predictionPanel.action', 'Action:')}</span>
          <strong className="metric-val">
            {isNeutralOrNoBet ? t('predictionPanel.passHold', 'Pass / Hold') : t('predictionPanel.highEdge', 'High Edge')}
          </strong>
        </div>
      </div>
    </div>
  );
};
