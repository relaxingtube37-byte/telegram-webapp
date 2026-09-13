import React from 'react';
import { Flame, Lock, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
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
  const allSections = parseAiDossierSections(match.ai_summary || '');
  // Deduplicate: exclude upset scenario / risk sections from the general cards stack (removing the duplicate top card)
  const sections = allSections.filter(
    s => s.type !== 'risk' &&
         !s.title.toLowerCase().includes('upset scenario') &&
         !s.title.toLowerCase().includes('devils advocate')
  );

  // Single source of truth for the red Critical Upset Scenario card (keeping this one)
  const upsetRisk = (match.devils_advocate_risk && match.devils_advocate_risk.trim()) ||
    allSections.find(
      s => s.type === 'risk' ||
           s.title.toLowerCase().includes('upset scenario') ||
           s.title.toLowerCase().includes('devils advocate')
    )?.body?.trim();

  // Deduplicate cards against upsetRisk
  const cards = (analytics?.cards || []).filter(c => {
    const titleLower = c.title.toLowerCase();
    if (titleLower.includes('upset scenario') || titleLower.includes('devils advocate')) return false;
    if (upsetRisk && c.description.trim() === upsetRisk) return false;
    return true;
  });

  if (!canSeeFullAi) {
    const previewSections = sections.length > 0 ? sections.slice(0, 1) : [];

    return (
      <div className="dossier-gate-container">
        {/* Background Teaser Content (Blurred) */}
        <div className="dossier-gate-blur-bg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="dossier-section-header">
              <Sparkles size={14} className="text-cyan" />
              <span>Pro Tactical Dossier &amp; Simulation</span>
            </div>
            {previewSections.length > 0 ? (
              <div className="dossier-card">
                <div className="dossier-card-header">
                  <span className="dossier-card-icon">{previewSections[0].icon}</span>
                  <span className="dossier-card-title">{previewSections[0].title}</span>
                </div>
                <p className="dossier-card-body">{previewSections[0].body}</p>
              </div>
            ) : (
              <div className="dossier-card">
                <p className="dossier-card-body">
                  Breakdown of hold/break synergy, court geometry advantages, and fatigue indexes.
                </p>
              </div>
            )}
            <div className="dossier-card">
              <div className="dossier-card-header">
                <Flame size={14} style={{ color: 'var(--accent-amber)' }} />
                <span className="dossier-card-title" style={{ color: 'var(--accent-amber)' }}>Key Decisive Factors</span>
              </div>
              <ul className="dossier-factors-list">
                <li>Second serve exploit differential on return games</li>
                <li>Clutch tiebreak win probability under pressure</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Foreground Elegant Blur Gate Card */}
        <div className="dossier-gate-overlay">
          <div className="dossier-gate-lock-icon">
            <Lock size={20} />
          </div>
          <h3 className="dossier-gate-title">Full Tactical Dossier &amp; Simulation</h3>
          <p className="dossier-gate-subtitle">
            Advanced serve/return KPIs, matchup exploit analysis, and upset scenarios are available for members.
          </p>
          {onUnlockClick && (
            <button
              type="button"
              className="btn-primary dossier-gate-btn"
              onClick={onUnlockClick}
            >
              <span>Connect Account for Full Access</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dossier-container">
      <div className="dossier-section-header">
        <Sparkles size={14} className="text-cyan" />
        <span>Tactical Match Dossier</span>
      </div>

      {sections.length > 0 && (
        <div className="dossier-cards-stack">
          {sections.map((sec, idx) => (
            <div key={idx} className="dossier-card">
              <div className="dossier-card-header">
                <span className="dossier-card-icon">{sec.icon}</span>
                <span className="dossier-card-title">{sec.title}</span>
              </div>
              <p className="dossier-card-body">{sec.body}</p>
            </div>
          ))}
        </div>
      )}

      {match.key_factors && match.key_factors.length > 0 && (
        <div className="dossier-factors-card">
          <div className="dossier-factors-header">
            <ShieldCheck size={14} className="text-emerald" />
            <span>Key Decisive Factors</span>
          </div>
          <ul className="dossier-factors-list">
            {match.key_factors.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {upsetRisk && (
        <div className="dossier-risk-card">
          <div className="dossier-risk-header">
            <AlertTriangle size={14} className="text-rose" />
            <span>Critical Upset Scenario</span>
          </div>
          <p className="dossier-risk-body">{upsetRisk}</p>
        </div>
      )}

      {cards.length > 0 && (
        <div className="dossier-cards-stack">
          {cards.map((card, i) => (
            <div key={i} className="dossier-card">
              <div className="dossier-card-header">
                <span className="dossier-card-title" style={{ color: 'var(--accent-amber)' }}>{card.title}</span>
              </div>
              <p className="dossier-card-body">{card.description}</p>
            </div>
          ))}
        </div>
      )}

      {sections.length === 0 && !match.key_factors?.length && !upsetRisk && cards.length === 0 && (
        <div className="dossier-card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          Detailed dossier text is not available for this match yet.
        </div>
      )}
    </div>
  );
};
