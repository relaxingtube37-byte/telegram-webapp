import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { Prediction } from '../../types';
import { formatPlayerDisplayName } from '../../utils/formatters';

interface MatchPredictionPanelProps {
  match: Prediction;
}

export const MatchPredictionPanel: React.FC<MatchPredictionPanelProps> = ({ match }) => {
  const winProb = match.win_probability ?? 0;
  const winner = (match.predicted_winner || '').trim().toLowerCase();
  const home = (match.home_name || '').trim().toLowerCase();
  const away = (match.away_name || '').trim().toLowerCase();

  const homeLean = Boolean(winner && home && (winner.includes(home) || home.includes(winner)));
  const awayLean = Boolean(winner && away && (winner.includes(away) || away.includes(winner)));

  return (
    <div className="glass" style={{ padding: '1.15rem 1.25rem', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--accent-cyan)' }}>
        Model lean & odds
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'start' }}>
        <div>
          <div style={{ fontWeight: 700, color: 'white', marginBottom: 4 }}>{formatPlayerDisplayName(match.home_name)}</div>
          {match.home_odds != null && match.home_odds !== '' && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Odds @{match.home_odds}</div>
          )}
          {homeLean && (
            <span style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', fontWeight: 800, color: '#4ade80', background: 'rgba(74,222,128,0.12)', padding: '0.2rem 0.5rem', borderRadius: 6 }}>
              <CheckCircle2 size={12} /> Likely winner
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingTop: 4 }}>vs</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, color: 'white', marginBottom: 4 }}>{formatPlayerDisplayName(match.away_name)}</div>
          {match.away_odds != null && match.away_odds !== '' && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Odds @{match.away_odds}</div>
          )}
          {awayLean && (
            <span style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', fontWeight: 800, color: '#4ade80', background: 'rgba(74,222,128,0.12)', padding: '0.2rem 0.5rem', borderRadius: 6 }}>
              <CheckCircle2 size={12} /> Likely winner
            </span>
          )}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
          <span>
            Likely winner: <strong style={{ color: 'white' }}>{formatPlayerDisplayName(match.predicted_winner)}</strong>
          </span>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>{winProb}% win probability</span>
        </div>
        <div className="confidence-bar-track" style={{ height: 7 }}>
          <div className="confidence-bar-fill" style={{ width: `${Math.min(Math.max(winProb, 8), 96)}%` }} />
        </div>
        {match.predicted_score && (
          <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Projected score: <strong style={{ color: 'white' }}>{match.predicted_score}</strong>
          </div>
        )}
        {match.confidence && (
          <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#d4a843', fontWeight: 700 }}>
            Confidence: {match.confidence}
          </div>
        )}
      </div>
    </div>
  );
};
