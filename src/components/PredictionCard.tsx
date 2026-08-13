import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Flame, Shield, CheckCircle, XCircle, Clock, Lock, Key } from 'lucide-react';
import type { Prediction } from '../types';

interface PredictionCardProps {
  prediction: Prediction;
  isLocked?: boolean;
  onUnlockClick?: () => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, isLocked = false, onUnlockClick }) => {
  const [expanded, setExpanded] = useState(false);

  const surfaceEmoji = prediction.surface?.toLowerCase().includes('clay') ? '🧱'
    : prediction.surface?.toLowerCase().includes('grass') ? '🌱' : '🟦';

  const statusBadge = prediction.status === 'WON' ? (
    <span className="badge badge-won"><CheckCircle size={12} /> WON ({prediction.result_score || '2:1'})</span>
  ) : prediction.status === 'LOST' ? (
    <span className="badge badge-lost"><XCircle size={12} /> LOST</span>
  ) : prediction.status === 'INTERRUPTED' ? (
    <span className="badge" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid #fbbf24' }}>⏸ INTERRUPTED</span>
  ) : prediction.status === 'VOID' ? (
    <span className="badge" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid #fbbf24' }}>🔄 VOID</span>
  ) : prediction.status === 'LIVE' ? (
    <span className="badge badge-live">● LIVE</span>
  ) : (
    <span className="badge badge-upcoming"><Clock size={12} /> UPCOMING</span>
  );

  return (
    <div className="glass" style={{ padding: '1.2rem', marginBottom: '1rem', position: 'relative', overflow: 'hidden' }}>
      {/* Top Bar: Tournament & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span>{surfaceEmoji}</span>
          <span>{prediction.tournament_name || 'Tennis Match'}</span>
          {prediction.round_name && <span style={{ opacity: 0.7 }}>• {prediction.round_name}</span>}
        </div>
        {statusBadge}
      </div>

      {/* Match Title: Home vs Away */}
      <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.8rem 1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'white', flex: 1 }}>
            {prediction.home_name}
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', padding: '0 0.8rem' }}>
            VS
          </div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'white', textAlign: 'right', flex: 1 }}>
            {prediction.away_name}
          </div>
        </div>

        {/* Odds if available */}
        {(prediction.home_odds || prediction.away_odds) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
            <span>Odds: {prediction.home_odds || '—'}</span>
            <span>Odds: {prediction.away_odds || '—'}</span>
          </div>
        )}
      </div>

      {/* LOCKED STATE DISPLAY */}
      {isLocked ? (
        <div style={{ background: 'rgba(251, 191, 36, 0.08)', border: '1px border-dashed rgba(251, 191, 36, 0.4)', borderRadius: '12px', padding: '1.2rem', textAlign: 'center' }}>
          <Lock size={28} color="var(--accent-amber)" style={{ marginBottom: '0.4rem' }} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', marginBottom: '0.3rem' }}>
            🔒 PREDICTION LOCKED
          </h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.9rem', lineHeight: 1.4 }}>
            Register on our partner bookmaker via affiliate link to instantly unlock all daily AI predictions & value bets!
          </p>
          <button
            onClick={onUnlockClick}
            className="btn-primary"
            style={{ width: '100%', fontSize: '0.82rem', padding: '0.65rem' }}
          >
            <Key size={14} /> Register & Unlock VIP Access
          </button>
        </div>
      ) : (
        <>
          {/* AI Verdict Box */}
      <div style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '0.9rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            AI PREDICTED WINNER
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-green)' }}>
            {prediction.win_probability || 65}% Win Prob
          </div>
        </div>

        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{prediction.predicted_winner}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', background: 'rgba(251, 191, 36, 0.15)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
            {prediction.predicted_score || '2:1'}
          </span>
        </div>
      </div>

      {/* Recommended Value Bet */}
      {prediction.best_bet_selection && (
        <div style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '10px', padding: '0.8rem 1rem', marginBottom: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Flame size={14} /> 🔥 Recommended Value Bet
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, background: 'rgba(34, 197, 94, 0.2)', color: 'var(--accent-green)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
              EV: {prediction.best_bet_ev || 'POSITIVE'}
            </span>
          </div>

          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>
            {prediction.best_bet_selection}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: 2 }}>
            Market: {prediction.best_bet_market || 'Full Time Winner'}
          </div>

          {prediction.best_bet_rationale && (
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontStyle: 'italic', marginTop: 4 }}>
              "{prediction.best_bet_rationale}"
            </div>
          )}
        </div>
      )}

      {/* Option Bet if available */}
      {prediction.alt_bet_selection && (
        <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '0.8rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
            <Shield size={13} /> 🛡 Option Bet: {prediction.alt_bet_selection}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-amber)' }}>
            Market: {prediction.alt_bet_market}
          </div>
        </div>
      )}

      {/* Expand/Collapse details toggle */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', cursor: 'pointer', paddingTop: '0.4rem' }}
      >
        {expanded ? <>Show Less <ChevronUp size={14} /></> : <>Show Full AI Breakdown <ChevronDown size={14} /></>}
      </button>

      {/* Expanded Breakdown Content */}
      {expanded && (
        <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {prediction.ai_summary && (
            <div style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.4, background: 'rgba(15,23,42,0.4)', padding: '0.6rem 0.8rem', borderRadius: 8 }}>
              {prediction.ai_summary}
            </div>
          )}

          {Array.isArray(prediction.key_factors) && prediction.key_factors.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '0.3rem' }}>⚡ Key Match Factors</div>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {prediction.key_factors.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
};
