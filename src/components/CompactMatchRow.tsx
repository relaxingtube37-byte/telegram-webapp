import React, { useState } from 'react';
import type { Prediction } from '../types';
import { 
  ChevronDown, ChevronUp, Trophy, 
  Key, Lock, Sparkles,
  CheckCircle2, XCircle, Clock, ExternalLink
} from 'lucide-react';
import { formatMatchTime, getCompactDateLabel, getSurfaceEmoji, formatPlayerDisplayName, getMatchGender, parseAiDossierSections } from '../utils/formatters';

interface CompactMatchRowProps {
  prediction: Prediction;
  selectedTimezone: string;
  isLocked?: boolean;
  onUnlockClick?: () => void;
  onOpenMatchPage?: (prediction: Prediction) => void;
}

export const CompactMatchRow: React.FC<CompactMatchRowProps> = ({
  prediction,
  selectedTimezone,
  isLocked = false,
  onUnlockClick,
  onOpenMatchPage,
}) => {
  const [expanded, setExpanded] = useState(false);
  const matchGender = getMatchGender(prediction.tournament_name, prediction.round_name, `${prediction.home_name} vs ${prediction.away_name}`, prediction.home_name, prediction.away_name);
  const isWomen = matchGender === 'women';

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

  const winProb = prediction.win_probability || 65;

  const rawScore = (prediction.result_score || '').trim();
  const compactScore = rawScore ? rawScore.split('(')[0].trim() : '2:1';

  const statusBadge = prediction.status === 'WON' ? (
    <span className="status-tag status-tag-won">
      <CheckCircle2 size={11} /> WON {compactScore}
    </span>
  ) : prediction.status === 'LOST' ? (
    <span className="status-tag status-tag-lost">
      <XCircle size={11} /> LOST {compactScore !== '2:1' ? compactScore : ''}
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
    <div className={`compact-match-row glass ${isWomen ? 'match-row-wta' : 'match-row-atp'} ${expanded ? 'expanded' : ''}`}>
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
            <span className={`tour-badge ${isWomen ? 'tour-badge-wta' : 'tour-badge-atp'}`}>{isWomen ? 'WTA' : 'ATP'}</span>
            <span className="surface-pill">{getSurfaceEmoji(prediction.surface)} {prediction.surface || 'Hard'}</span>
            {prediction.tournament_name && <span className="tourn-name-text"> · {prediction.tournament_name}</span>}
            {prediction.round_name && <span className="text-secondary"> ({prediction.round_name})</span>}
          </div>

          {/* Home Player */}
          <div className="compact-player-line">
            <span className="player-name-text">{formatPlayerDisplayName(prediction.home_name)}</span>
            {prediction.home_odds && prediction.home_odds !== 'N/A' && (
              <span className="player-odds-pill">{prediction.home_odds}</span>
            )}
            {isHomeWinner && <span className="winner-tag-pill" title="AI Projected Winner">✓ Predicted Winner</span>}
          </div>

          {/* Away Player */}
          <div className="compact-player-line">
            <span className="player-name-text">{formatPlayerDisplayName(prediction.away_name)}</span>
            {prediction.away_odds && prediction.away_odds !== 'N/A' && (
              <span className="player-odds-pill">{prediction.away_odds}</span>
            )}
            {isAwayWinner && <span className="winner-tag-pill" title="AI Projected Winner">✓ Predicted Winner</span>}
          </div>
        </div>

        {/* Win Probability Badge & Toggle Chevron */}
        <div className="compact-actions-col">
          <div className="compact-prob-badge">
            {winProb}%
          </div>

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
                Register on our verified partner platform to instantly unlock all VIP Analyses, Tactical Breakdowns & Real-Time Probability Matrices!
              </p>
              <button onClick={onUnlockClick} className="btn-primary btn-unlock">
                <Key size={14} /> Register & Unlock Free VIP Access
              </button>
            </div>
          ) : (
            <div className="details-content">
              {/* 🏆 Tier 2: AI Winner Verdict & Win Probability */}
              <div className="details-prediction-card">
                <div className="details-card-top">
                  <span className="details-label">
                    <Trophy size={13} color="#38bdf8" /> AI WINNER VERDICT
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {prediction.confidence && (
                      <span className="confidence-pill" style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                        {prediction.confidence}
                      </span>
                    )}
                    <span className="details-prob">{winProb}% Win Probability</span>
                  </div>
                </div>
                <div className="details-card-winner">
                  <span className="winner-title-text">{prediction.predicted_winner}</span>
                  {prediction.predicted_score && (
                    <span className="details-score-badge">Projected: {prediction.predicted_score}</span>
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

              {/* 🧠 Tier 3: In-Depth Analytical Match Dossier */}
              {(prediction.ai_summary || (prediction.key_factors && prediction.key_factors.length > 0)) && (
                <div className="details-ai-box">
                  <div className="details-ai-header">
                    <Sparkles size={14} color="#38bdf8" />
                    <span>In-Depth Tactical & Statistical Match Analysis</span>
                  </div>

                  {/* Multi-Agent Analytical Dossier Cards */}
                  {prediction.ai_summary && (
                    <div className="details-ai-text-flow" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
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
                          <p className="details-ai-paragraph" style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.55, color: '#e2e8f0', textAlign: 'left' }}>
                            {sec.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Key Match Analytics */}
                  {prediction.key_factors && prediction.key_factors.length > 0 && (
                    <div className="details-ai-factors">
                      <div className="factors-subtitle">⚡ Key Decisive Factors:</div>
                      <ul className="factors-list">
                        {prediction.key_factors.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Upset Vulnerability / Critical Risk Analysis */}
                  {prediction.devils_advocate_risk && !parseAiDossierSections(prediction.ai_summary).some(s => s.type === 'risk') && (
                    <div className="details-ai-risk">
                      <span className="risk-tag">⚠️ Critical Upset Scenario:</span> {prediction.devils_advocate_risk}
                    </div>
                  )}
                </div>
              )}

              {/* Optional Full Standalone Page Button (Web / SEO) */}
              {onOpenMatchPage && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenMatchPage(prediction);
                    }}
                    style={{
                      background: 'rgba(56, 189, 248, 0.08)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      color: 'var(--accent-cyan)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '0.4rem 0.8rem',
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <ExternalLink size={12} /> View Dedicated Match Page
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
