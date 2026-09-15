import React, { useState, useMemo } from 'react';
import type { ProIntelligencePayload, PlayerSkillsDecagon } from '../../types';
import { Sparkles, Shield, Zap, BatteryCharging, HeartHandshake, Eye, EyeOff, Layers, Activity } from 'lucide-react';

interface ProIntelligenceCardProps {
  intel: ProIntelligencePayload;
  surface?: string;
  homeName?: string;
  awayName?: string;
  h2hSummary?: { total: number; p1Wins: number; p2Wins: number } | null;
  p1Form?: { currentStreak: string | null; recentScores?: string[] } | null;
  p2Form?: { currentStreak: string | null; recentScores?: string[] } | null;
  isLocked?: boolean;
  onUnlockClick?: () => void;
}

const RADAR_METRICS: { key: keyof PlayerSkillsDecagon; label: string; group: 'serve' | 'return' | 'clutch' }[] = [
  { key: 'serveGames', label: 'Serve Games', group: 'serve' },
  { key: 'firstServePts', label: '1st Serve Pts', group: 'serve' },
  { key: 'firstServeAcc', label: '1st Serve Acc', group: 'serve' },
  { key: 'secondServePts', label: '2nd Serve Pts', group: 'serve' },
  { key: 'bpsSaved', label: 'BPs Saved', group: 'serve' },
  { key: 'tbsWon', label: 'TBs Won', group: 'clutch' },
  { key: 'returnGames', label: 'Return Games', group: 'return' },
  { key: 'returnFirstPts', label: 'Return 1st Pts', group: 'return' },
  { key: 'returnSecondPts', label: 'Return 2nd Pts', group: 'return' },
  { key: 'returnBpsWon', label: 'Return BPs Won', group: 'return' },
];

function getPlayerLastName(fullName: string, fallbackName?: string): string {
  const target = (fallbackName || fullName || '').trim();
  if (!target) return 'Player';
  const parts = target.split(/\s+/);
  if (parts.length === 1) return parts[0];
  // If formatted like "Parry D.", return "Parry"
  if (parts[parts.length - 1].length <= 2) {
    return parts[0];
  }
  // If formatted like "Diane Parry", return "Parry"
  return parts[parts.length - 1];
}

function getPlayerFullName(fullName: string, fallbackName?: string): string {
  if (fallbackName && fallbackName.length >= fullName.length) return fallbackName;
  return fullName;
}

function FormPills({ scores = [] }: { scores?: string[] }) {
  const badges = (scores || []).slice(0, 5).map((s) => (s.startsWith('W') ? 'W' : 'L'));
  if (badges.length === 0) return <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>—</span>;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {badges.map((b, i) => (
        <span
          key={i}
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            fontSize: '0.62rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: b === 'W' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: b === 'W' ? '#4ade80' : '#f87171',
            border: b === 'W' ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
          }}
        >
          {b}
        </span>
      ))}
    </div>
  );
}

interface DualBarItem {
  label: string;
  r1: number;
  r2: number;
  v1: string;
  v2: string;
}

function SymmetricalDualBar({ item, p1Color = '#38bdf8', p2Color = '#fb7185' }: { item: DualBarItem; p1Color?: string; p2Color?: string }) {
  const p1Leads = item.r1 >= item.r2;
  const p2Leads = item.r2 >= item.r1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '3px 0' }}>
      {/* Metric Values & Center Label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
        {/* P1 Left: Percentage + Tour Index Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '82px' }}>
          <span style={{
            fontWeight: 900,
            fontSize: '0.84rem',
            color: p1Leads ? p1Color : 'rgba(255, 255, 255, 0.75)',
            textShadow: p1Leads ? `0 0 10px ${p1Color}40` : 'none',
          }}>
            {item.v1}
          </span>
          <span style={{
            fontSize: '0.62rem',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.45)',
            background: 'rgba(255, 255, 255, 0.06)',
            padding: '1px 5px',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }} title="Tour Rating Score (0-100)">
            {item.r1}
          </span>
        </div>

        {/* Center Label */}
        <span style={{
          color: '#e4e4e7',
          fontWeight: 700,
          fontSize: '0.74rem',
          textAlign: 'center',
          flex: 1,
          padding: '0 8px',
          letterSpacing: '0.01em',
        }}>
          {item.label}
        </span>

        {/* P2 Right: Tour Index Badge + Percentage */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', minWidth: '82px' }}>
          <span style={{
            fontSize: '0.62rem',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.45)',
            background: 'rgba(255, 255, 255, 0.06)',
            padding: '1px 5px',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }} title="Tour Rating Score (0-100)">
            {item.r2}
          </span>
          <span style={{
            fontWeight: 900,
            fontSize: '0.84rem',
            color: p2Leads ? p2Color : 'rgba(255, 255, 255, 0.75)',
            textShadow: p2Leads ? `0 0 10px ${p2Color}40` : 'none',
          }}>
            {item.v2}
          </span>
        </div>
      </div>

      {/* Opposing Progress Track (SofaScore standard) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2px 1fr',
        gap: '4px',
        alignItems: 'center',
        height: 7,
      }}>
        {/* P1 Bar (Fills towards center) */}
        <div style={{
          height: '100%',
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '4px 0 0 4px',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <div style={{
            width: `${Math.min(100, Math.max(8, item.r1))}%`,
            background: p1Leads
              ? 'linear-gradient(270deg, #06b6d4 0%, #3b82f6 100%)'
              : 'rgba(6, 182, 212, 0.35)',
            borderRadius: '3px',
            boxShadow: p1Leads ? '0 0 8px rgba(6, 182, 212, 0.4)' : 'none',
            transition: 'width 0.4s ease',
          }} />
        </div>

        {/* Center Divider */}
        <div style={{ width: 2, height: '100%', background: 'rgba(255, 255, 255, 0.25)', borderRadius: 1 }} />

        {/* P2 Bar (Fills away from center) */}
        <div style={{
          height: '100%',
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '0 4px 4px 0',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'flex-start',
        }}>
          <div style={{
            width: `${Math.min(100, Math.max(8, item.r2))}%`,
            background: p2Leads
              ? 'linear-gradient(90deg, #f43f5e 0%, #ec4899 100%)'
              : 'rgba(244, 63, 94, 0.35)',
            borderRadius: '3px',
            boxShadow: p2Leads ? '0 0 8px rgba(244, 63, 94, 0.4)' : 'none',
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>
    </div>
  );
}

export const ProIntelligenceCard: React.FC<ProIntelligenceCardProps> = ({
  intel,
  surface,
  homeName,
  awayName,
  h2hSummary,
  p1Form,
  p2Form,
  isLocked = false,
  onUnlockClick,
}) => {
  const [viewMode, setViewMode] = useState<'both' | 'p1' | 'p2'>('both');
  const [activeMetricHover, setActiveMetricHover] = useState<number | null>(null);

  const { player1: p1, player2: p2, meta } = intel;

  const p1Short = getPlayerLastName(p1.name, homeName);
  const p2Short = getPlayerLastName(p2.name, awayName);
  const p1FullName = getPlayerFullName(p1.name, homeName);
  const p2FullName = getPlayerFullName(p2.name, awayName);

  // SVG Canvas and Radius dimensions for 10-axis decagon
  const svgWidth = 380;
  const svgHeight = 330;
  const centerX = svgWidth / 2; // 190
  const centerY = svgHeight / 2; // 165
  const maxRadius = 90; // Web radius

  const getCoordinates = (index: number, scoreRatio: number) => {
    const angle = (Math.PI * 2 * index) / 10 - Math.PI / 2;
    const r = Math.max(12, Math.min(maxRadius, maxRadius * scoreRatio));
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  const getLabelProps = (index: number) => {
    const angle = (Math.PI * 2 * index) / 10 - Math.PI / 2;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // Top: index 0 (Serve Games)
    if (index === 0) {
      return {
        x: centerX,
        y: centerY - maxRadius - 16,
        textAnchor: 'middle' as const,
        dominantBaseline: 'auto' as const,
      };
    }
    // Bottom: index 5 (TBs Won)
    if (index === 5) {
      return {
        x: centerX,
        y: centerY + maxRadius + 22,
        textAnchor: 'middle' as const,
        dominantBaseline: 'hanging' as const,
      };
    }
    // Right hemisphere: indices 1, 2, 3, 4
    if (cosA > 0.1) {
      return {
        x: centerX + (maxRadius + 14) * cosA + 10,
        y: centerY + (maxRadius + 14) * sinA,
        textAnchor: 'start' as const,
        dominantBaseline: 'central' as const,
      };
    }
    // Left hemisphere: indices 6, 7, 8, 9
    return {
      x: centerX + (maxRadius + 14) * cosA - 10,
      y: centerY + (maxRadius + 14) * sinA,
      textAnchor: 'end' as const,
      dominantBaseline: 'central' as const,
    };
  };

  const p1PolygonPoints = useMemo(() => {
    return RADAR_METRICS.map((m, i) => {
      const score = p1.radar[m.key] || 50;
      const pt = getCoordinates(i, score / 100);
      return `${pt.x},${pt.y}`;
    }).join(' ');
  }, [p1]);

  const p2PolygonPoints = useMemo(() => {
    return RADAR_METRICS.map((m, i) => {
      const score = p2.radar[m.key] || 50;
      const pt = getCoordinates(i, score / 100);
      return `${pt.x},${pt.y}`;
    }).join(' ');
  }, [p2]);

  // Decagon concentric web rings
  const webRings = [0.2, 0.4, 0.6, 0.8, 1.0].map((level) => {
    return Array.from({ length: 10 }).map((_, i) => {
      const pt = getCoordinates(i, level);
      return `${pt.x},${pt.y}`;
    }).join(' ');
  });

  const serveItems: DualBarItem[] = [
    { label: 'Service Games Won', r1: p1.radar.serveGames, r2: p2.radar.serveGames, v1: p1.skills.serveWonPct, v2: p2.skills.serveWonPct },
    { label: '1st Serve Pts Won', r1: p1.radar.firstServePts, r2: p2.radar.firstServePts, v1: p1.skills.firstServeWonPct, v2: p2.skills.firstServeWonPct },
    { label: '2nd Serve Pts Won', r1: p1.radar.secondServePts, r2: p2.radar.secondServePts, v1: p1.skills.secondServeWonPct, v2: p2.skills.secondServeWonPct },
    { label: 'Break Pts Saved', r1: p1.radar.bpsSaved, r2: p2.radar.bpsSaved, v1: p1.skills.bpSavedPct, v2: p2.skills.bpSavedPct },
  ];

  const returnItems: DualBarItem[] = [
    { label: 'Return Games Won', r1: p1.radar.returnGames, r2: p2.radar.returnGames, v1: p1.skills.returnGamesWonPct, v2: p2.skills.returnGamesWonPct },
    { label: 'Return 1st Pts Won', r1: p1.radar.returnFirstPts, r2: p2.radar.returnFirstPts, v1: p1.skills.return1stPtsPct, v2: p2.skills.return1stPtsPct },
    { label: 'Return 2nd Pts Won', r1: p1.radar.returnSecondPts, r2: p2.radar.returnSecondPts, v1: p1.skills.return2ndPtsPct, v2: p2.skills.return2ndPtsPct },
    { label: 'Break Pts Converted', r1: p1.radar.returnBpsWon, r2: p2.radar.returnBpsWon, v1: p1.skills.bpConvertedPct, v2: p2.skills.bpConvertedPct },
  ];

  return (
    <div className="glass" style={{
      padding: '1.25rem',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'linear-gradient(180deg, rgba(20, 24, 34, 0.96) 0%, rgba(10, 12, 18, 0.98) 100%)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ── Top Header: Tour Skills Dossier & H2H Capsule ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        paddingBottom: '0.85rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        {/* Left: Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            padding: '7px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(6, 182, 212, 0.35)',
          }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#fff', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{meta.tour || 'PRO'} TOUR SKILLS &amp; PERFORMANCE RADAR</span>
              <span style={{ fontSize: '0.65rem', background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', padding: '2px 7px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                {meta.surface || surface || 'Official'}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              10-Axis Decagon Spider Radar &amp; Genuine Historical Matchup Intelligence
            </div>
          </div>
        </div>

        {/* Right: View Mode Buttons */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '3px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            type="button"
            onClick={() => setViewMode('both')}
            style={{
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 800,
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'both' ? '#27272a' : 'transparent',
              color: viewMode === 'both' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            H2H Overlay
          </button>
          <button
            type="button"
            onClick={() => setViewMode('p1')}
            style={{
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 800,
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'p1' ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
              color: viewMode === 'p1' ? '#38bdf8' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {p1Short}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('p2')}
            style={{
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 800,
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'p2' ? 'rgba(244, 63, 94, 0.25)' : 'transparent',
              color: viewMode === 'p2' ? '#fb7185' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {p2Short}
          </button>
        </div>
      </div>

      {/* ── Subheader: Dual Player Form & H2H Status Capsule ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '10px',
        padding: '0.6rem 0.85rem',
        marginBottom: '1.25rem',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        {/* P1 Form Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4', display: 'inline-block' }} />
          <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#38bdf8' }}>{p1FullName}</span>
          {p1Form?.recentScores && <FormPills scores={p1Form.recentScores} />}
        </div>

        {/* H2H Center Badge */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '2px 10px',
          borderRadius: 99,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.68rem',
          fontWeight: 800,
          color: 'var(--text-secondary)',
          textAlign: 'center',
        }}>
          {h2hSummary && h2hSummary.total > 0 ? (
            <span>H2H: <strong style={{ color: '#fff' }}>{h2hSummary.p1Wins} - {h2hSummary.p2Wins}</strong></span>
          ) : (
            <span style={{ color: '#38bdf8' }}>1st Career Tour Meeting</span>
          )}
        </div>

        {/* P2 Form Right */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          {p2Form?.recentScores && <FormPills scores={p2Form.recentScores} />}
          <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#fb7185' }}>{p2FullName}</span>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e', display: 'inline-block' }} />
        </div>
      </div>

      {/* ── Main 2-Column Layout: Radar Left, Progress Bars Right ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        alignItems: 'center',
      }}>
        {/* Left Column: 10-Axis Decagon Spider Radar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ overflow: 'visible', maxWidth: '100%', height: 'auto' }}
          >
            <defs>
              <linearGradient id="p1Grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.25" />
              </linearGradient>
              <linearGradient id="p2Grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
              </linearGradient>
              <filter id="glowP1" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>

            {/* Concentric Web Rings */}
            {webRings.map((points, idx) => (
              <polygon
                key={idx}
                points={points}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth={idx === 4 ? '1.5' : '0.8'}
                strokeDasharray={idx === 4 ? 'none' : '2,2'}
              />
            ))}

            {/* 10 Spoke Axes */}
            {Array.from({ length: 10 }).map((_, i) => {
              const edge = getCoordinates(i, 1.0);
              return (
                <line
                  key={i}
                  x1={centerX}
                  y1={centerY}
                  x2={edge.x}
                  y2={edge.y}
                  stroke="rgba(255, 255, 255, 0.09)"
                  strokeWidth="0.8"
                />
              );
            })}

            {/* Player 2 Polygon Layer */}
            {(viewMode === 'both' || viewMode === 'p2') && (
              <polygon
                points={p2PolygonPoints}
                fill="url(#p2Grad)"
                stroke="#f43f5e"
                strokeWidth="2"
                style={{ transition: 'all 0.4s ease' }}
              />
            )}

            {/* Player 1 Polygon Layer */}
            {(viewMode === 'both' || viewMode === 'p1') && (
              <polygon
                points={p1PolygonPoints}
                fill="url(#p1Grad)"
                stroke="#06b6d4"
                strokeWidth="2.5"
                filter="url(#glowP1)"
                style={{ transition: 'all 0.4s ease' }}
              />
            )}

            {/* Vertices & Outer Labels */}
            {RADAR_METRICS.map((m, i) => {
              const labelPos = getLabelProps(i);
              const vP1 = getCoordinates(i, (p1.radar[m.key] || 50) / 100);
              const vP2 = getCoordinates(i, (p2.radar[m.key] || 50) / 100);

              const isHovered = activeMetricHover === i;

              return (
                <g key={i} onMouseEnter={() => setActiveMetricHover(i)} onMouseLeave={() => setActiveMetricHover(null)}>
                  {/* P2 vertex dot */}
                  {(viewMode === 'both' || viewMode === 'p2') && (
                    <circle cx={vP2.x} cy={vP2.y} r="3.5" fill="#f43f5e" stroke="#fff" strokeWidth="1" />
                  )}

                  {/* P1 vertex dot */}
                  {(viewMode === 'both' || viewMode === 'p1') && (
                    <circle cx={vP1.x} cy={vP1.y} r="4" fill="#06b6d4" stroke="#fff" strokeWidth="1.5" />
                  )}

                  {/* Outer Label text */}
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor={labelPos.textAnchor}
                    dominantBaseline={labelPos.dominantBaseline}
                    fill={isHovered ? '#38bdf8' : 'rgba(255, 255, 255, 0.85)'}
                    fontSize="9.5"
                    fontWeight={isHovered ? 800 : 600}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.9)',
                    }}
                  >
                    {m.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#06b6d4', display: 'inline-block', boxShadow: '0 0 8px #06b6d4' }} />
              <span style={{ color: '#fff', fontWeight: 800 }}>{p1FullName}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f43f5e', display: 'inline-block', boxShadow: '0 0 8px #f43f5e' }} />
              <span style={{ color: '#fff', fontWeight: 800 }}>{p2FullName}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Symmetrical Skill Rating Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
          {/* Serve Group */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.95rem', borderRadius: '14px', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
            {/* Symmetrical Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '8px',
              marginBottom: '10px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4', display: 'inline-block' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#38bdf8' }}>{p1Short}</span>
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Zap size={13} /> Serve Mastery
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#fb7185' }}>{p2Short}</span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e', display: 'inline-block' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {serveItems.map((item, idx) => (
                <SymmetricalDualBar key={idx} item={item} />
              ))}
            </div>
          </div>

          {/* Return & Pressure Group */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.95rem', borderRadius: '14px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
            {/* Symmetrical Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '8px',
              marginBottom: '10px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4', display: 'inline-block' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#38bdf8' }}>{p1Short}</span>
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Shield size={13} /> Return &amp; Pressure
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#fb7185' }}>{p2Short}</span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e', display: 'inline-block' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {returnItems.map((item, idx) => (
                <SymmetricalDualBar key={idx} item={item} />
              ))}
            </div>
          </div>

          {/* Overall Composite: Dominance & Efficiency (Both Players) */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.025)',
            padding: '0.95rem',
            borderRadius: '14px',
            border: '1px solid rgba(234, 179, 8, 0.25)',
          }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Activity size={14} /> Tactical Dominance &amp; Tour Efficiency
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              {/* Player 1 */}
              <div style={{ background: 'rgba(6, 182, 212, 0.06)', padding: '0.75rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 900, color: '#38bdf8', marginBottom: '6px' }}>{p1Short}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  <span>Dominance Ratio</span>
                  <strong style={{ color: '#fff' }}>{p1.skills.dominanceRatioScore}/100</strong>
                </div>
                <div style={{ height: 4, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 2, marginBottom: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${p1.skills.dominanceRatioScore}%`, height: '100%', background: '#06b6d4', borderRadius: 2 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  <span>Efficiency Index</span>
                  <strong style={{ color: '#fff' }}>{p1.skills.matchEfficiencyScore}/100</strong>
                </div>
                <div style={{ height: 4, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${p1.skills.matchEfficiencyScore}%`, height: '100%', background: '#3b82f6', borderRadius: 2 }} />
                </div>
              </div>

              {/* Player 2 */}
              <div style={{ background: 'rgba(244, 63, 94, 0.06)', padding: '0.75rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 900, color: '#fb7185', marginBottom: '6px' }}>{p2Short}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  <span>Dominance Ratio</span>
                  <strong style={{ color: '#fff' }}>{p2.skills.dominanceRatioScore}/100</strong>
                </div>
                <div style={{ height: 4, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 2, marginBottom: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${p2.skills.dominanceRatioScore}%`, height: '100%', background: '#f43f5e', borderRadius: 2 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  <span>Efficiency Index</span>
                  <strong style={{ color: '#fff' }}>{p2.skills.matchEfficiencyScore}/100</strong>
                </div>
                <div style={{ height: 4, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${p2.skills.matchEfficiencyScore}%`, height: '100%', background: '#ec4899', borderRadius: 2 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer Row: Dual Physical Battery & Mental Grit Cards ── */}
      <div style={{
        marginTop: '1.5rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
      }}>
        {/* Player 1 Card */}
        <div style={{
          background: 'rgba(6, 182, 212, 0.04)',
          border: '1px solid rgba(6, 182, 212, 0.22)',
          borderRadius: '14px',
          padding: '1rem 1.1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#38bdf8' }}>{p1FullName}</span>
            <span style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: 4, background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', fontWeight: 800 }}>PLAYER 1</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BatteryCharging size={18} color="#22c55e" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>
                <span style={{ color: '#22c55e' }}>{p1.readiness.statusLabel} ({p1.readiness.energyScore}%)</span>
              </div>
              <div style={{ height: 3, width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 2, margin: '3px 0', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${p1.readiness.energyScore}%`, background: '#22c55e', borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Rest Window: {p1.readiness.restLabel}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <HeartHandshake size={18} color="#06b6d4" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>
                <span style={{ color: '#38bdf8' }}>{p1.mental.verdict}</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                1st Set Lead Win: {p1.mental.frontRunnerWinPct} · Comeback Rate: {p1.mental.comebackRatePct}
              </div>
            </div>
          </div>
        </div>

        {/* Player 2 Card */}
        <div style={{
          background: 'rgba(244, 63, 94, 0.04)',
          border: '1px solid rgba(244, 63, 94, 0.22)',
          borderRadius: '14px',
          padding: '1rem 1.1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#fb7185' }}>{p2FullName}</span>
            <span style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: 4, background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', fontWeight: 800 }}>PLAYER 2</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BatteryCharging size={18} color="#22c55e" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>
                <span style={{ color: '#22c55e' }}>{p2.readiness.statusLabel} ({p2.readiness.energyScore}%)</span>
              </div>
              <div style={{ height: 3, width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 2, margin: '3px 0', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${p2.readiness.energyScore}%`, background: '#22c55e', borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Rest Window: {p2.readiness.restLabel}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <HeartHandshake size={18} color="#f43f5e" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>
                <span style={{ color: '#f472b6' }}>{p2.mental.verdict}</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                1st Set Lead Win: {p2.mental.frontRunnerWinPct} · Comeback Rate: {p2.mental.comebackRatePct}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
