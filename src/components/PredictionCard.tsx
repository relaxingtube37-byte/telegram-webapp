import { getMatchGender, parseAiDossierSections, parseTennisScore } from '../utils/formatters';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Lock, Key } from 'lucide-react';
import type { Prediction } from '../types';

interface PredictionCardProps {
  prediction: Prediction;
  isLocked?: boolean;
  onUnlockClick?: () => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, isLocked = false, onUnlockClick }) => {
  const [expanded, setExpanded] = useState(false);
  const matchGender = getMatchGender(prediction.tournament_name, prediction.round_name, `${prediction.home_name} vs ${prediction.away_name}`, prediction.home_name, prediction.away_name);
  const isWomen = matchGender === 'women';

  const surfaceEmoji = prediction.surface?.toLowerCase().includes('clay') ? '🧱'
    : prediction.surface?.toLowerCase().includes('grass') ? '🌱' : '🟦';

  const parsedScore = parseTennisScore(prediction.result_score, prediction.status);

  const statusBadge = prediction.status === 'WON' ? (
    <span className="badge badge-won"><CheckCircle size={12} /> WON ({parsedScore?.setsScore || '2-0'})</span>
  ) : prediction.status === 'LOST' ? (
    <span className="badge badge-lost"><XCircle size={12} /> LOST ({parsedScore?.setsScore || '0-2'})</span>
  ) : prediction.status === 'INTERRUPTED' ? (
    <span className="badge" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid #fbbf24' }}>⏸ INTERRUPTED</span>
  ) : prediction.status === 'VOID' ? (
    <span className="badge" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid #fbbf24' }}>🔄 VOID</span>
  ) : prediction.status === 'LIVE' ? (
    <span className="badge badge-live">● LIVE {parsedScore?.summaryText ? `• ${parsedScore.summaryText}` : ''}</span>
  ) : (
    <span className="badge badge-upcoming"><Clock size={12} /> UPCOMING</span>
  );


  return (
    <div className={`glass ${isWomen ? 'match-row-wta' : 'match-row-atp'}`} style={{ padding: '1.2rem', marginBottom: '1rem', position: 'relative', overflow: 'hidden' }}>
      {/* Top Bar: Tournament & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span className={`tour-badge ${isWomen ? 'tour-badge-wta' : 'tour-badge-atp'}`}>{isWomen ? 'WTA' : 'ATP'}</span>
          <span>{surfaceEmoji}</span>
          <span>{prediction.tournament_name || 'Tennis Match'}</span>
          {prediction.round_name && <span style={{ opacity: 0.7 }}>• {prediction.round_name}</span>}
        </div>
        {statusBadge}
      </div>

      {/* Match Title: Home vs Away */}
      <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.8rem 1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'white', flex: 1, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span>{prediction.home_name}</span>
            {prediction.home_odds && prediction.home_odds !== 'N/A' && (
              <span className="player-odds-pill" style={{ fontSize: '0.72rem', padding: '0.1rem 0.35rem' }}>{prediction.home_odds}</span>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', padding: '0 0.8rem' }}>
            VS
          </div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'white', textAlign: 'right', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.45rem' }}>
            {prediction.away_odds && prediction.away_odds !== 'N/A' && (
              <span className="player-odds-pill" style={{ fontSize: '0.72rem', padding: '0.1rem 0.35rem' }}>{prediction.away_odds}</span>
            )}
            <span>{prediction.away_name}</span>
          </div>
        </div>
      </div>

      {/* LOCKED STATE DISPLAY */}
      {isLocked ? (
        <div style={{ background: 'rgba(251, 191, 36, 0.08)', border: '1px border-dashed rgba(251, 191, 36, 0.4)', borderRadius: '12px', padding: '1.2rem', textAlign: 'center' }}>
          <Lock size={28} color="var(--accent-amber)" style={{ marginBottom: '0.4rem' }} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', marginBottom: '0.3rem' }}>
            🔒 PREDICTION LOCKED
          </h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.9rem', lineHeight: 1.4 }}>
            Connect your account to access all daily AI match predictions & deep tactical insights!
          </p>
          <button
            onClick={onUnlockClick}
            className="btn-primary"
            style={{ width: '100%', fontSize: '0.82rem', padding: '0.65rem' }}
          >
            <Key size={14} /> Connect Account & Unlock Analysis
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
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            {prediction.confidence && (
              <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontWeight: 700 }}>
                {prediction.confidence}
              </span>
            )}
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-green)' }}>
              {prediction.win_probability || 65}% Win Prob
            </span>
          </div>
        </div>

        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{prediction.predicted_winner}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', background: 'rgba(251, 191, 36, 0.15)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
            {prediction.predicted_score ? `Projected: ${prediction.predicted_score}` : 'Projected Winner'}
          </span>
        </div>
      </div>

      {/* Expand/Collapse details toggle */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', cursor: 'pointer', paddingTop: '0.4rem' }}
      >
        {expanded ? <>Show Less <ChevronUp size={14} /></> : <>Show Full AI Breakdown <ChevronDown size={14} /></>}
      </button>

      {/* Expanded Breakdown Content */}
      {expanded && (
        <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {prediction.ai_summary && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {parseAiDossierSections(prediction.ai_summary).map((sec, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    background: sec.bg,
                    border: `1px solid ${sec.border}`,
                    borderLeft: `3px solid ${sec.color}`,
                    borderRadius: '8px',
                    padding: '0.75rem 0.9rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.76rem', fontWeight: 800, color: sec.color, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    <span style={{ fontSize: '0.95rem' }}>{sec.icon}</span>
                    <span>{sec.title}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.55 }}>
                    {sec.body}
                  </div>
                </div>
              ))}
            </div>
          )}

          {Array.isArray(prediction.key_factors) && prediction.key_factors.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '0.3rem' }}>⚡ Key Decisive Factors</div>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {prediction.key_factors.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {prediction.devils_advocate_risk && !parseAiDossierSections(prediction.ai_summary).some(s => s.type === 'risk') && (
            <div style={{ fontSize: '0.78rem', color: '#fca5a5', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '0.6rem 0.8rem', borderRadius: 8, lineHeight: 1.4 }}>
              <span style={{ fontWeight: 700, color: '#f87171' }}>⚠️ Critical Upset Scenario: </span>
              {prediction.devils_advocate_risk}
            </div>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
};
