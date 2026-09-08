import React from 'react';
import { Flame, Lock, Sparkles } from 'lucide-react';
import type { Prediction } from '../../types';
import type { MappedDeepAnalytics } from '../../match/mapDeepAnalytics';
import { parseAiDossierSections } from '../../utils/formatters';

interface MatchDeepAnalysisProps {
  match: Prediction;
  analytics: MappedDeepAnalytics | null;
  canSeeFullAi: boolean;
  onUnlockClick?: () => void;
}

export const MatchDeepAnalysis: React.FC<MatchDeepAnalysisProps> = ({
  match,
  analytics,
  canSeeFullAi,
  onUnlockClick,
}) => {
  if (!canSeeFullAi) {
    return (
      <div
        className="glass"
        style={{
          padding: '1.6rem 1.3rem',
          borderRadius: 14,
          textAlign: 'center',
          border: '1px solid rgba(251, 191, 36, 0.28)',
          background: 'linear-gradient(180deg, rgba(251, 191, 36, 0.05) 0%, rgba(15, 23, 42, 0.65) 100%)',
        }}
      >
        <Lock size={22} color="#fbbf24" style={{ marginBottom: 10 }} />
        <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.05rem', fontWeight: 800, color: 'white' }}>
          Full AI match analysis
        </h3>
        <p style={{ margin: '0 auto 1rem', maxWidth: 420, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Tactical dossier, key factors, and explanation cards are available after member unlock. Odds and likely winner stay visible above.
        </p>
        {onUnlockClick && (
          <button type="button" className="btn-primary" onClick={onUnlockClick} style={{ padding: '0.7rem 1.4rem', fontWeight: 800 }}>
            Unlock full AI analysis
          </button>
        )}
      </div>
    );
  }

  const sections = parseAiDossierSections(match.ai_summary || '');
  const cards = analytics?.cards || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        <Sparkles size={15} /> Deep AI analysis
      </div>

      {sections.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {sections.map((sec, idx) => (
            <div
              key={idx}
              style={{
                background: sec.bg,
                border: `1px solid ${sec.border}`,
                borderLeft: `3px solid ${sec.color}`,
                borderRadius: 10,
                padding: '0.85rem 1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 800, color: sec.color, textTransform: 'uppercase', marginBottom: 4 }}>
                <span>{sec.icon}</span>
                <span>{sec.title}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: 1.55, color: '#e2e8f0' }}>{sec.body}</p>
            </div>
          ))}
        </div>
      )}

      {match.key_factors && match.key_factors.length > 0 && (
        <div className="glass" style={{ padding: '1rem 1.1rem', borderRadius: 10 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-amber)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Flame size={14} /> Key decisive factors
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {match.key_factors.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {match.devils_advocate_risk && (
        <div style={{ fontSize: '0.82rem', color: '#fca5a5', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.28)', padding: '0.8rem 1rem', borderRadius: 10, lineHeight: 1.5 }}>
          <strong style={{ color: '#f87171' }}>Upset scenario: </strong>
          {match.devils_advocate_risk}
        </div>
      )}

      {cards.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {cards.map((card, i) => (
            <div key={i} className="glass" style={{ padding: '0.8rem 0.95rem', borderRadius: 10 }}>
              <div style={{ fontWeight: 800, fontSize: '0.78rem', color: 'var(--accent-amber)', marginBottom: 4 }}>{card.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{card.description}</div>
            </div>
          ))}
        </div>
      )}

      {sections.length === 0 && !match.key_factors?.length && cards.length === 0 && (
        <div className="glass" style={{ padding: '1rem', borderRadius: 10, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Detailed dossier text is not available for this match yet.
        </div>
      )}
    </div>
  );
};
