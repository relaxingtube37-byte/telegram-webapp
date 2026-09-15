import React, { useState, useMemo } from 'react';
import type { ProIntelligencePayload, PlayerSkillsDecagon } from '../../types';
import { Sparkles, Shield, Zap, BatteryCharging, HeartHandshake, Eye, EyeOff } from 'lucide-react';

interface ProIntelligenceCardProps {
  intel: ProIntelligencePayload;
  surface?: string;
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

export const ProIntelligenceCard: React.FC<ProIntelligenceCardProps> = ({
  intel,
  isLocked = false,
  onUnlockClick,
}) => {
  const [viewMode, setViewMode] = useState<'both' | 'p1' | 'p2'>('both');
  const [activeMetricHover, setActiveMetricHover] = useState<number | null>(null);

  const { player1: p1, player2: p2, meta } = intel;

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
    // Right hemisphere: indices 1, 2, 3, 4 (1st Serve Pts, 1st Serve Acc, 2nd Serve Pts, BPs Saved)
    if (cosA > 0.1) {
      return {
        x: centerX + (maxRadius + 14) * cosA + 10,
        y: centerY + (maxRadius + 14) * sinA,
        textAnchor: 'start' as const,
        dominantBaseline: 'central' as const,
      };
    }
    // Left hemisphere: indices 6, 7, 8, 9 (Return Games, Return 1st Pts, Return 2nd Pts, Return BPs Won)
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

  return (
    <div className="glass" style={{
      padding: '1.25rem',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'linear-gradient(180deg, rgba(24, 24, 27, 0.95) 0%, rgba(9, 9, 11, 0.98) 100%)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ── Header Badge & Title ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            padding: '6px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{meta.tour} TOUR SKILLS & PRO INTEL</span>
              <span style={{ fontSize: '0.65rem', background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                {meta.courtSpeedLabel || 'Official'}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              10-Axis Skills Dossier & Biomechanical Matchup
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '3px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            type="button"
            onClick={() => setViewMode('both')}
            style={{
              padding: '4px 9px',
              fontSize: '0.72rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'both' ? '#27272a' : 'transparent',
              color: viewMode === 'both' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            H2H Overlay
          </button>
          <button
            type="button"
            onClick={() => setViewMode('p1')}
            style={{
              padding: '4px 9px',
              fontSize: '0.72rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'p1' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: viewMode === 'p1' ? '#38bdf8' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {p1.name.split(' ').pop()}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('p2')}
            style={{
              padding: '4px 9px',
              fontSize: '0.72rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'p2' ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
              color: viewMode === 'p2' ? '#fb7185' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {p2.name.split(' ').pop()}
          </button>
        </div>
      </div>

      {/* ── Main 2-Column Layout: Radar Left, Progress Bars Right ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
        gap: '1.25rem',
        alignItems: 'center',
      }}>
        {/* Left Column: 10-Axis Decagon Spider Radar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ overflow: 'visible', maxWidth: '100%', height: 'auto' }}>
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
          <div style={{ display: 'flex', gap: '1.2rem', marginTop: '0.4rem', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#06b6d4', display: 'inline-block', boxShadow: '0 0 8px #06b6d4' }} />
              <span style={{ color: '#fff', fontWeight: 700 }}>{p1.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f43f5e', display: 'inline-block', boxShadow: '0 0 8px #f43f5e' }} />
              <span style={{ color: '#fff', fontWeight: 700 }}>{p2.name}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Categorized Skill Ratings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Serve Group */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Zap size={13} /> Serve Mastery
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Service Games Won', r1: p1.radar.serveGames, r2: p2.radar.serveGames, v1: p1.skills.serveWonPct, v2: p2.skills.serveWonPct },
                { label: '1st Serve Pts Won', r1: p1.radar.firstServePts, r2: p2.radar.firstServePts, v1: p1.skills.firstServeWonPct, v2: p2.skills.firstServeWonPct },
                { label: '2nd Serve Pts Won', r1: p1.radar.secondServePts, r2: p2.radar.secondServePts, v1: p1.skills.secondServeWonPct, v2: p2.skills.secondServeWonPct },
                { label: 'Break Pts Saved', r1: p1.radar.bpsSaved, r2: p2.radar.bpsSaved, v1: p1.skills.bpSavedPct, v2: p2.skills.bpSavedPct },
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                    <span style={{ color: '#e4e4e7', fontWeight: 600 }}>{item.label}</span>
                    <span>
                      <strong style={{ color: '#38bdf8' }}>{item.r1}</strong> ({item.v1}) vs <strong style={{ color: '#fb7185' }}>{item.r2}</strong> ({item.v2})
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${item.r1}%`, background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Return & Pressure Group */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Shield size={13} /> Return & Pressure
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Return Games Won', r1: p1.radar.returnGames, r2: p2.radar.returnGames, v1: p1.skills.returnGamesWonPct, v2: p2.skills.returnGamesWonPct },
                { label: 'Return 1st Pts Won', r1: p1.radar.returnFirstPts, r2: p2.radar.returnFirstPts, v1: p1.skills.return1stPtsPct, v2: p2.skills.return1stPtsPct },
                { label: 'Return 2nd Pts Won', r1: p1.radar.returnSecondPts, r2: p2.radar.returnSecondPts, v1: p1.skills.return2ndPtsPct, v2: p2.skills.return2ndPtsPct },
                { label: 'Break Pts Converted', r1: p1.radar.returnBpsWon, r2: p2.radar.returnBpsWon, v1: p1.skills.bpConvertedPct, v2: p2.skills.bpConvertedPct },
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                    <span style={{ color: '#e4e4e7', fontWeight: 600 }}>{item.label}</span>
                    <span>
                      <strong style={{ color: '#38bdf8' }}>{item.r1}</strong> vs <strong style={{ color: '#fb7185' }}>{item.r2}</strong>
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${item.r1}%`, background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Composite */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
              Match Dominance & Efficiency
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Dominance Ratio</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#facc15', marginTop: '2px' }}>
                  {p1.skills.dominanceRatioScore} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 100</span>
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Match Efficiency</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#facc15', marginTop: '2px' }}>
                  {p1.skills.matchEfficiencyScore} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer Row: Bio-Fatigue Readiness & Mental Resilience ── */}
      <div style={{
        marginTop: '1.25rem',
        paddingTop: '1rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1rem',
      }}>
        {/* Physical Readiness */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem 0.9rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BatteryCharging size={20} color="#22c55e" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Physical Readiness
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff' }}>
              {p1.name.split(' ').pop()}: <span style={{ color: '#22c55e' }}>{p1.readiness.statusLabel} ({p1.readiness.energyScore}%)</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Rest window: {p1.readiness.restLabel}
            </div>
          </div>
        </div>

        {/* Mental Grit & Clutch */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem 0.9rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HeartHandshake size={20} color="#ec4899" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Mental Grit & Clutch
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff' }}>
              {p1.name.split(' ').pop()}: <span style={{ color: '#f472b6' }}>{p1.mental.verdict}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              1st set win conversion: {p1.mental.frontRunnerWinPct} · Comeback rate: {p1.mental.comebackRatePct}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
