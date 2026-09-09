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
  const sections = parseAiDossierSections(match.ai_summary || '');
  const cards = analytics?.cards || [];

  if (!canSeeFullAi) {
    const previewSections = sections.length > 0 ? sections.slice(0, 1) : [];

    return (
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 14, minHeight: 220 }}>
        {/* Background Teaser Content (Blurred) */}
        <div style={{ filter: 'blur(5px)', pointerEvents: 'none', opacity: 0.4, userSelect: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              <Sparkles size={15} /> Pro Tactical Dossier &amp; Simulation
            </div>
            {previewSections.length > 0 ? (
              <div style={{ background: previewSections[0].bg, borderRadius: 10, padding: '0.85rem 1rem' }}>
                <div style={{ fontWeight: 800, color: previewSections[0].color, marginBottom: 4 }}>{previewSections[0].title}</div>
                <p style={{ margin: 0, fontSize: '0.84rem' }}>{previewSections[0].body}</p>
              </div>
            ) : (
              <div className="glass" style={{ padding: '1rem', borderRadius: 10 }}>
                Breakdown of hold/break synergy, court geometry advantages, and fatigue indexes.
              </div>
            )}
            <div className="glass" style={{ padding: '1rem', borderRadius: 10 }}>
              <div style={{ fontWeight: 800, color: 'var(--accent-amber)', marginBottom: 6 }}>Key Decisive Factors</div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem' }}>
                <li>Second serve exploit differential on return games</li>
                <li>Clutch tiebreak win probability under pressure</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Foreground Elegant Blur Gate Card */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.95) 100%)',
            backdropFilter: 'blur(8px)',
            borderRadius: 14,
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(56, 189, 248, 0.25)',
          }}
        >
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.8rem',
            color: '#38bdf8'
          }}>
            <Lock size={20} />
          </div>
          <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
            Full Tactical Dossier &amp; Simulation
          </h3>
          <p style={{ margin: '0 auto 1.1rem', maxWidth: 380, fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
            Advanced serve/return KPIs, matchup exploit analysis, and upset scenarios are available for members.
          </p>
          {onUnlockClick && (
            <button
              type="button"
              className="btn-primary"
              onClick={onUnlockClick}
              style={{
                padding: '0.65rem 1.4rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(56, 189, 248, 0.25)',
              }}
            >
              <span>Connect Account for Full Access</span>
            </button>
          )}
        </div>
      </div>
    );
  }

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
