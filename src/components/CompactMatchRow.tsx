import React, { useState } from 'react';
import type { Prediction } from '../types';
import {
  ChevronDown, ChevronUp, Trophy,
  Key, Lock, Sparkles,
  CheckCircle2, XCircle, Clock, ExternalLink, TrendingUp
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
  const compactScore = rawScore ? rawScore.split('(')[0].trim() : '';

  const isFinished = prediction.status === 'WON' || prediction.status === 'LOST';

  // Status badge
  const statusBadge = prediction.status === 'WON' ? (
    <span className="status-tag status-tag-won">
      <CheckCircle2 size={11} /> WON {compactScore}
    </span>
  ) : prediction.status === 'LOST' ? (
    <span className="status-tag status-tag-lost">
      <XCircle size={11} /> LOST {compactScore}
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

  const tourBadgeClass = isWomen ? 'tour-badge tour-badge-wta' : 'tour-badge tour-badge-atp';
  const tourLabel = isWomen ? 'WTA' : 'ATP';

  return (
    <div className={`compact-match-row ${isWomen ? 'match-row-wta' : 'match-row-atp'} ${expanded ? 'expanded' : ''}`}>

      {/* ── Clickable Header Row ── */}
      <div
        className="compact-row-header"
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
        style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.55rem', padding: '0.8rem 0.9rem 0.7rem 0.9rem' }}
      >
        {/* Top meta row: tournament + surface + time/status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className={tourBadgeClass}>{tourLabel}</span>
          {prediction.tournament_name && (
            <span style={{
              fontSize: '0.68rem', fontWeight: 700,
              color: '#d4a843',
              background: 'rgba(212,168,67,0.1)',
              border: '1px solid rgba(212,168,67,0.22)',
              padding: '0.08rem 0.45rem',
              borderRadius: 20,
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem'
            }}>
              <Trophy size={10} color="#d4a843" />
              {prediction.tournament_name.split(',')[0]}
            </span>
          )}
          <span style={{
            fontSize: '0.64rem', color: '#7a9580',
            background: 'rgba(255,255,255,0.04)',
            padding: '0.07rem 0.38rem',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {getSurfaceEmoji(prediction.surface)} {prediction.surface || 'Hard'}
          </span>
          {matchDateLabel && (
            <span style={{ fontSize: '0.62rem', color: '#4a6455', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
              {matchDateLabel}
            </span>
          )}
          <div style={{ flexShrink: 0 }}>{statusBadge}</div>
        </div>

        {/* Players row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Home player */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              fontWeight: isHomeWinner ? 800 : 600,
              fontSize: isHomeWinner ? '0.95rem' : '0.88rem',
              color: isHomeWinner ? '#f0f4f1' : '#8aaa90',
            }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {formatPlayerDisplayName(prediction.home_name)}
              </span>
              {isHomeWinner && (
                <span style={{
                  fontSize: '0.58rem', fontWeight: 800, color: '#4ade80',
                  background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)',
                  padding: '0.04rem 0.3rem', borderRadius: 4, flexShrink: 0,
                }}>✓ PICK</span>
              )}
            </div>
            {prediction.home_odds && prediction.home_odds !== 'N/A' && (
              <div style={{ fontSize: '0.65rem', color: '#d4a843', marginTop: 1 }}>
                @{prediction.home_odds}
              </div>
            )}
          </div>

          {/* VS separator */}
          <div style={{
            flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(212,168,67,0.12)',
            border: '1px solid rgba(212,168,67,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', fontWeight: 900, color: '#d4a843',
          }}>
            VS
          </div>

          {/* Away player */}
          <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              fontWeight: isAwayWinner ? 800 : 600,
              fontSize: isAwayWinner ? '0.95rem' : '0.88rem',
              color: isAwayWinner ? '#f0f4f1' : '#8aaa90',
              justifyContent: 'flex-end',
            }}>
              {isAwayWinner && (
                <span style={{
                  fontSize: '0.58rem', fontWeight: 800, color: '#4ade80',
                  background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)',
                  padding: '0.04rem 0.3rem', borderRadius: 4, flexShrink: 0,
                }}>✓ PICK</span>
              )}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {formatPlayerDisplayName(prediction.away_name)}
              </span>
            </div>
            {prediction.away_odds && prediction.away_odds !== 'N/A' && (
              <div style={{ fontSize: '0.65rem', color: '#d4a843', marginTop: 1 }}>
                @{prediction.away_odds}
              </div>
            )}
          </div>
        </div>

        {/* Win probability bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.62rem', color: '#7a9580', fontWeight: 600 }}>
              Win probability
            </span>
            <span style={{ fontSize: '0.65rem', color: '#4ade80', fontWeight: 800 }}>
              {prediction.predicted_winner ? formatPlayerDisplayName(prediction.predicted_winner) : '—'} {winProb}%
            </span>
          </div>
          <div style={{
            width: '100%', height: 6, borderRadius: 4,
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(Math.max(winProb, 10), 96)}%`,
              background: 'linear-gradient(90deg, #4ade80 0%, #d4a843 100%)',
              borderRadius: 4,
              transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }} />
          </div>
        </div>

        {/* Bottom action row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {prediction.best_bet_market && prediction.best_bet_market !== 'NO_BET' && (
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, color: '#4ade80',
              background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.28)',
              padding: '0.15rem 0.5rem', borderRadius: 20,
            }}>
              {prediction.best_bet_market}
            </span>
          )}
          {prediction.confidence && (
            <span style={{
              fontSize: '0.62rem', fontWeight: 800, color: '#d4a843',
              background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.28)',
              padding: '0.15rem 0.5rem', borderRadius: 20,
              display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
            }}>
              ★ {prediction.confidence}
            </span>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.68rem', color: '#d4a843', fontWeight: 700 }}>
              {expanded ? 'Close' : 'View Analysis'}
            </span>
            {expanded
              ? <ChevronUp size={15} color="#d4a843" />
              : <ChevronDown size={15} color="#7a9580" />
            }
          </div>
        </div>
      </div>

      {/* ── Expandable Intelligence Drawer ── */}
      {expanded && (
        <div className="compact-details-drawer">
          {isLocked ? (
            <div className="locked-box">
              <Lock size={28} color="#d4a843" />
              <div className="locked-title">🔒 FULL AI INTELLIGENCE LOCKED</div>
              <p className="locked-desc">
                Register on our verified partner platform to instantly unlock all VIP Analyses, Tactical Breakdowns &amp; Real-Time Probability Matrices!
              </p>
              <button onClick={onUnlockClick} className="btn-primary btn-unlock">
                <Key size={14} /> Register &amp; Unlock Free VIP Access
              </button>
            </div>
          ) : (
            <div className="details-content">
              {/* AI Winner Verdict */}
              <div className="details-prediction-card">
                <div className="details-card-top">
                  <span className="details-label">
                    <Trophy size={13} color="#d4a843" /> AI WINNER VERDICT
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {prediction.confidence && (
                      <span className="confidence-pill" style={{
                        fontSize: '0.68rem', padding: '0.14rem 0.42rem', borderRadius: '4px',
                        background: 'rgba(212,168,67,0.15)', color: '#d4a843',
                        fontWeight: 700, border: '1px solid rgba(212,168,67,0.3)'
                      }}>
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
                <div className="confidence-bar-track">
                  <div
                    className="confidence-bar-fill"
                    style={{ width: `${Math.min(Math.max(winProb, 15), 100)}%` }}
                  />
                </div>
              </div>

              {/* In-Depth Analysis */}
              {(prediction.ai_summary || (prediction.key_factors && prediction.key_factors.length > 0)) && (
                <div className="details-ai-box">
                  <div className="details-ai-header">
                    <Sparkles size={14} color="#d4a843" />
                    <span>In-Depth Tactical &amp; Statistical Match Analysis</span>
                  </div>

                  {prediction.ai_summary && (
                    <div className="details-ai-text-flow" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {parseAiDossierSections(prediction.ai_summary).map((sec, sIdx) => (
                        <div
                          key={sIdx}
                          style={{
                            background: sec.bg,
                            border: `1px solid ${sec.border}`,
                            borderLeft: `3px solid ${sec.color}`,
                            borderRadius: '9px',
                            padding: '0.75rem 0.9rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.35rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.74rem', fontWeight: 800, color: sec.color, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                            <span style={{ fontSize: '0.95rem' }}>{sec.icon}</span>
                            <span>{sec.title}</span>
                          </div>
                          <p className="details-ai-paragraph" style={{ margin: 0 }}>
                            {sec.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

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

                  {prediction.devils_advocate_risk && !parseAiDossierSections(prediction.ai_summary).some(s => s.type === 'risk') && (
                    <div className="details-ai-risk">
                      <span className="risk-tag">⚠️ Critical Upset Scenario:</span> {prediction.devils_advocate_risk}
                    </div>
                  )}
                </div>
              )}

              {/* View Full Match Page button */}
              {onOpenMatchPage && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenMatchPage(prediction);
                    }}
                    style={{
                      background: 'rgba(212,168,67,0.08)',
                      border: '1px solid rgba(212,168,67,0.28)',
                      color: '#d4a843',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '0.4rem 0.85rem',
                      borderRadius: 8,
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
