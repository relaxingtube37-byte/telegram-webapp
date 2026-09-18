import React from 'react';
import type { IModernTelemetryHub } from '../../types';
import { useTranslation } from '../../i18n';
import { Zap, Activity, Gauge, Flame } from 'lucide-react';

interface ModernTelemetryHubProps {
  data?: IModernTelemetryHub;
  homeName: string;
  awayName: string;
  className?: string;
}

export const ModernTelemetryHub: React.FC<ModernTelemetryHubProps> = ({
  data,
  homeName,
  awayName,
  className = '',
}) => {
  const { t, isRtl } = useTranslation();

  if (!data) return null;

  const { biomechanics, mental_clutch, court_dynamics, synergy_clash } = data;

  const p1Short = homeName.split(/\s+/).pop() || homeName;
  const p2Short = awayName.split(/\s+/).pop() || awayName;

  // Harmonized Deep State Palette: Player 1 = Cyan, Player 2 = Rose
  const P1_COLOR = '#38bdf8';
  const P1_ACCENT = '#06b6d4';
  const P1_GLOW = 'rgba(6, 182, 212, 0.45)';
  const P1_BORDER = 'rgba(6, 182, 212, 0.2)';

  const P2_COLOR = '#fb7185';
  const P2_ACCENT = '#f43f5e';
  const P2_GLOW = 'rgba(244, 63, 94, 0.45)';
  const P2_BORDER = 'rgba(244, 63, 94, 0.2)';

  // Unified Container Glassmorphism (Harmonized across all modules)
  const cardContainerStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(20, 24, 34, 0.75) 0%, rgba(12, 15, 22, 0.85) 100%)',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '0.85rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.65rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '0.45rem',
  };

  // Concise Localized Labels (Shortened & Punchy)
  const mt = {
    biomechanicsTitle: t('proIntelligence.modernTelemetry.biomechanicsTitle', 'Biomechanics'),
    biomechanicsSubtitle: t('proIntelligence.modernTelemetry.biomechanicsSubtitle', 'Load & Energy'),
    energyTank: t('proIntelligence.modernTelemetry.energyTank', 'Energy'),
    workloadRatio: t('proIntelligence.modernTelemetry.workloadRatio', 'ACWR'),
    restClock: t('proIntelligence.modernTelemetry.restClock', 'Rest'),
    matches7d: t('proIntelligence.modernTelemetry.matches7d', 'Matches (7d)'),
    mentalTitle: t('proIntelligence.modernTelemetry.mentalTitle', 'Mental Clutch'),
    mentalSubtitle: t('proIntelligence.modernTelemetry.mentalSubtitle', 'Pressure Index'),
    clutchRating: t('proIntelligence.modernTelemetry.clutchRating', 'Clutch'),
    comebackRate: t('proIntelligence.modernTelemetry.comebackRate', 'Comeback %'),
    frontRunner: t('proIntelligence.modernTelemetry.frontRunner', 'Lead Win %'),
    tensionDelta: t('proIntelligence.modernTelemetry.tensionDelta', 'Tension Δ'),
    courtDynamicsTitle: t('proIntelligence.modernTelemetry.courtDynamicsTitle', 'Court Pace & ELO'),
    courtDynamicsSubtitle: t('proIntelligence.modernTelemetry.courtDynamicsSubtitle', 'Speed & Edge'),
    cpi: t('proIntelligence.modernTelemetry.cpi', 'CPI'),
    surfaceElo: t('proIntelligence.modernTelemetry.surfaceElo', 'Surface ELO'),
    surfaceAdvantage: t('proIntelligence.modernTelemetry.surfaceAdvantage', 'Edge'),
    synergyTitle: t('proIntelligence.modernTelemetry.synergyTitle', 'Total Synergy (TSI)'),
    synergySubtitle: t('proIntelligence.modernTelemetry.synergySubtitle', 'Hold% + Break%'),
    tsiBenchmark: t('proIntelligence.modernTelemetry.tsiBenchmark', 'Tour Par: 105%'),
    dominanceRatio: t('proIntelligence.modernTelemetry.dominanceRatio', 'DR'),
    powerBalance: t('proIntelligence.modernTelemetry.powerBalance', 'Hold / Break'),
  };

  const localizeStatus = (statusKey: string) => {
    const key = (statusKey || '').toUpperCase();
    if (key.includes('PEAK')) return t('proIntelligence.modernTelemetry.statuses.peakReadiness', 'PEAK');
    if (key.includes('OPTIMAL')) return t('proIntelligence.modernTelemetry.statuses.optimal', 'OPTIMAL');
    if (key.includes('MODERATE')) return t('proIntelligence.modernTelemetry.statuses.moderateLoad', 'MODERATE');
    if (key.includes('RISK')) return t('proIntelligence.modernTelemetry.statuses.fatigueRisk', 'FATIGUE RISK');
    return t('proIntelligence.modernTelemetry.statuses.highFatigue', 'HIGH FATIGUE');
  };

  const localizeVerdict = (verdictKey: string) => {
    const key = (verdictKey || '').toUpperCase();
    if (key.includes('ELITE')) return t('proIntelligence.modernTelemetry.verdicts.eliteClutch', 'ELITE');
    if (key.includes('RESOLUTE')) return t('proIntelligence.modernTelemetry.verdicts.resolute', 'RESOLUTE');
    if (key.includes('STEADY')) return t('proIntelligence.modernTelemetry.verdicts.steady', 'STEADY');
    return t('proIntelligence.modernTelemetry.verdicts.vulnerable', 'VULNERABLE');
  };

  const localizeTier = (tierKey: string) => {
    const key = (tierKey || '').toUpperCase();
    if (key.includes('ELITE')) return t('proIntelligence.modernTelemetry.tiers.elite', 'ELITE');
    if (key.includes('SOLID')) return t('proIntelligence.modernTelemetry.tiers.solid', 'SOLID');
    return t('proIntelligence.modernTelemetry.tiers.vulnerable', 'VULNERABLE');
  };

  const localizeCpi = (cpiLabel: string) => {
    const key = (cpiLabel || '').toUpperCase();
    if (key.includes('SLOW')) return t('proIntelligence.modernTelemetry.cpiSpeeds.slow', 'Slow');
    if (key.includes('MEDIUM_FAST') || key.includes('MEDIUM FAST')) return t('proIntelligence.modernTelemetry.cpiSpeeds.mediumFast', 'Medium-Fast');
    if (key.includes('FAST')) return t('proIntelligence.modernTelemetry.cpiSpeeds.fast', 'Fast');
    return t('proIntelligence.modernTelemetry.cpiSpeeds.medium', 'Medium');
  };

  // Render Compact Orbital Ring: Number cleanly centered inside; tag capsule underneath
  const renderRing = (pct: number, color: string, glowColor: string) => {
    const size = 76;
    const strokeWidth = 5.5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const cleanPct = Math.min(100, Math.max(0, pct));
    const offset = circumference - (cleanPct / 100) * circumference;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.07)"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.8s ease-out',
                filter: `drop-shadow(0 0 6px ${glowColor})`,
              }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{
              fontSize: '1.05rem',
              fontWeight: 900,
              color: '#fff',
              fontFamily: 'monospace',
              lineHeight: 1,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
            }}>
              {cleanPct}%
            </span>
          </div>
        </div>
        <div style={{
          marginTop: '6px',
          fontSize: '0.62rem',
          fontWeight: 700,
          color: 'var(--text-secondary, #cbd5e1)',
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '1px 7px',
          borderRadius: 4,
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          {mt.energyTank}
        </div>
      </div>
    );
  };

  // ACWR badge style
  const getAcwrStyle = (acwr: number) => {
    if (acwr > 1.45) return { bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.35)', color: '#fb7185' };
    if (acwr >= 0.85 && acwr <= 1.35) return { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.35)', color: '#4ade80' };
    return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.35)', color: '#fbbf24' };
  };

  const p1AcwrStyle = getAcwrStyle(biomechanics.p1_acwr);
  const p2AcwrStyle = getAcwrStyle(biomechanics.p2_acwr);

  return (
    <div
      className={className}
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        width: '100%',
      }}
    >
      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 1. BIOMECHANICS & ENERGY (ACWR)                                   */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <div style={cardContainerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} color={P1_ACCENT} />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {mt.biomechanicsTitle}
            </span>
          </div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)' }}>{mt.biomechanicsSubtitle}</span>
        </div>

        {/* Dual Player Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          {/* Player 1 Orbit */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${P1_BORDER}`,
            borderRadius: '10px',
            padding: '0.65rem 0.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: P1_COLOR, marginBottom: '0.35rem', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p1Short}
            </span>
            {renderRing(biomechanics.p1_energy_tank_pct, P1_ACCENT, P1_GLOW)}

            <div style={{ width: '100%', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.66rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary, #cbd5e1)' }}>
                <span>{mt.workloadRatio}:</span>
                <strong style={{ color: P1_COLOR, fontFamily: 'monospace' }}>{biomechanics.p1_acwr}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary, #cbd5e1)' }}>
                <span>{mt.restClock}:</span>
                <span style={{ color: '#fff' }}>{biomechanics.p1_rest_label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '1px 7px', borderRadius: 99, background: p1AcwrStyle.bg, border: `1px solid ${p1AcwrStyle.border}`, color: p1AcwrStyle.color }}>
                  {localizeStatus(biomechanics.p1_status)}
                </span>
              </div>
            </div>
          </div>

          {/* Player 2 Orbit (Harmonized Rose) */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${P2_BORDER}`,
            borderRadius: '10px',
            padding: '0.65rem 0.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: P2_COLOR, marginBottom: '0.35rem', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p2Short}
            </span>
            {renderRing(biomechanics.p2_energy_tank_pct, P2_ACCENT, P2_GLOW)}

            <div style={{ width: '100%', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.66rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary, #cbd5e1)' }}>
                <span>{mt.workloadRatio}:</span>
                <strong style={{ color: P2_COLOR, fontFamily: 'monospace' }}>{biomechanics.p2_acwr}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary, #cbd5e1)' }}>
                <span>{mt.restClock}:</span>
                <span style={{ color: '#fff' }}>{biomechanics.p2_rest_label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '1px 7px', borderRadius: 99, background: p2AcwrStyle.bg, border: `1px solid ${p2AcwrStyle.border}`, color: p2AcwrStyle.color }}>
                  {localizeStatus(biomechanics.p2_status)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 2. MENTAL CLUTCH & PRESSURE                                       */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <div style={cardContainerStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} color="#f59e0b" />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {mt.mentalTitle}
            </span>
          </div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)' }}>{mt.mentalSubtitle}</span>
        </div>

        {/* Clash Bar (SofaScore Symmetrical Opposing Progress Track) */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '0.65rem', marginBottom: '0.55rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: P1_COLOR }}>{p1Short}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{mental_clutch.p1_clutch_rating10}</span>
            </div>
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              padding: '2px 8px',
              borderRadius: 99,
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-secondary, #cbd5e1)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              {mt.clutchRating}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{mental_clutch.p2_clutch_rating10}</span>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: P2_COLOR }}>{p2Short}</span>
            </div>
          </div>

          {/* Duel Progress Track */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2px 1fr',
            gap: '4px',
            alignItems: 'center',
            height: 7,
            margin: '6px 0',
          }}>
            <div style={{ height: '100%', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px 0 0 4px', overflow: 'hidden', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{
                width: `${Math.min(100, Math.max(8, (mental_clutch.p1_clutch_score / 10) * 100))}%`,
                background: 'linear-gradient(270deg, #06b6d4 0%, #3b82f6 100%)',
                borderRadius: '3px',
                boxShadow: '0 0 8px rgba(6, 182, 212, 0.4)',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ width: 2, height: '100%', background: 'rgba(255, 255, 255, 0.25)', borderRadius: 1 }} />
            <div style={{ height: '100%', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '0 4px 4px 0', overflow: 'hidden', display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                width: `${Math.min(100, Math.max(8, (mental_clutch.p2_clutch_score / 10) * 100))}%`,
                background: 'linear-gradient(90deg, #f43f5e 0%, #ec4899 100%)',
                borderRadius: '3px',
                boxShadow: '0 0 8px rgba(244, 63, 94, 0.4)',
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.62rem', marginTop: '5px', color: 'var(--text-muted, #94a3b8)' }}>
            <span style={{ color: P1_COLOR, fontWeight: 700 }}>{localizeVerdict(mental_clutch.p1_verdict)}</span>
            <span>{mt.tensionDelta}: <strong style={{ color: '#fff' }}>{mental_clutch.tension_delta > 0 ? `+${mental_clutch.tension_delta}` : mental_clutch.tension_delta}</strong></span>
            <span style={{ color: P2_COLOR, fontWeight: 700 }}>{localizeVerdict(mental_clutch.p2_verdict)}</span>
          </div>
        </div>

        {/* Lead & Comeback Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.66rem' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.45rem 0.6rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted, #94a3b8)', display: 'block', marginBottom: '2px' }}>{mt.frontRunner}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800 }}>
              <span style={{ color: P1_COLOR }}>{mental_clutch.p1_front_runner_pct}%</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>vs</span>
              <span style={{ color: P2_COLOR }}>{mental_clutch.p2_front_runner_pct}%</span>
            </div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.45rem 0.6rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted, #94a3b8)', display: 'block', marginBottom: '2px' }}>{mt.comebackRate}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800 }}>
              <span style={{ color: P1_COLOR }}>{mental_clutch.p1_comeback_pct}%</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>vs</span>
              <span style={{ color: P2_COLOR }}>{mental_clutch.p2_comeback_pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 3. COURT PACE & SURFACE ELO                                       */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <div style={cardContainerStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Gauge size={14} color="#34d399" />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {mt.courtDynamicsTitle}
            </span>
          </div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)' }}>{mt.courtDynamicsSubtitle}</span>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '0.7rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Surface & CPI Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.55rem' }}>
            <span style={{ fontSize: '0.64rem', fontWeight: 900, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 99, background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
              {court_dynamics.surface}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #cbd5e1)' }}>
              CPI: <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{court_dynamics.cpi}</strong> ({localizeCpi(court_dynamics.cpi_label)})
            </span>
          </div>

          {/* ELO Clash */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '0.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: P1_COLOR }}>{p1Short}</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{court_dynamics.p1_surface_elo}</span>
              <span style={{ fontSize: '0.58rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>{mt.surfaceElo}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.35)', padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: '0.58rem', fontWeight: 800, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>{mt.surfaceAdvantage}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 900, fontFamily: 'monospace', color: court_dynamics.elo_delta > 0 ? P1_COLOR : court_dynamics.elo_delta < 0 ? P2_COLOR : '#fff' }}>
                {court_dynamics.elo_delta > 0 ? `+${court_dynamics.elo_delta} ${p1Short}` : court_dynamics.elo_delta < 0 ? `+${Math.abs(court_dynamics.elo_delta)} ${p2Short}` : 'EVEN'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: P2_COLOR }}>{p2Short}</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{court_dynamics.p2_surface_elo}</span>
              <span style={{ fontSize: '0.58rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>{mt.surfaceElo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 4. TOTAL SYNERGY (TSI & DOMINANCE)                                */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <div style={cardContainerStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={14} color="#38bdf8" />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {mt.synergyTitle}
            </span>
          </div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)' }}>{mt.synergySubtitle}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          {/* P1 Synergy Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${P1_BORDER}`,
            borderRadius: '10px',
            padding: '0.6rem 0.55rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: P1_COLOR }}>{p1Short}</span>
              <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '1px 5px', borderRadius: 4, background: synergy_clash.p1_tier === 'ELITE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.15)', color: synergy_clash.p1_tier === 'ELITE' ? '#34d399' : P1_COLOR, border: '1px solid rgba(255,255,255,0.1)' }}>
                {localizeTier(synergy_clash.p1_tier)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)' }}>TSI (H+B):</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{synergy_clash.p1_tsi}%</span>
            </div>

            <div style={{ height: 4, width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (synergy_clash.p1_tsi / 120) * 100)}%`, height: '100%', background: P1_COLOR, borderRadius: 2 }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)', marginTop: '2px' }}>
              <span>DR: <strong style={{ color: P1_COLOR, fontFamily: 'monospace' }}>{synergy_clash.p1_dr.toFixed(2)}</strong></span>
              <span>{synergy_clash.p1_hold}% / {synergy_clash.p1_break}%</span>
            </div>
          </div>

          {/* P2 Synergy Card (Harmonized Rose) */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${P2_BORDER}`,
            borderRadius: '10px',
            padding: '0.6rem 0.55rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: P2_COLOR }}>{p2Short}</span>
              <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '1px 5px', borderRadius: 4, background: synergy_clash.p2_tier === 'ELITE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.15)', color: synergy_clash.p2_tier === 'ELITE' ? '#34d399' : P2_COLOR, border: '1px solid rgba(255,255,255,0.1)' }}>
                {localizeTier(synergy_clash.p2_tier)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)' }}>TSI (H+B):</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{synergy_clash.p2_tsi}%</span>
            </div>

            <div style={{ height: 4, width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (synergy_clash.p2_tsi / 120) * 100)}%`, height: '100%', background: P2_ACCENT, borderRadius: 2 }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)', marginTop: '2px' }}>
              <span>DR: <strong style={{ color: P2_COLOR, fontFamily: 'monospace' }}>{synergy_clash.p2_dr.toFixed(2)}</strong></span>
              <span>{synergy_clash.p2_hold}% / {synergy_clash.p2_break}%</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.6rem', color: 'var(--text-muted, #64748b)', marginTop: '0.45rem' }}>
          {mt.tsiBenchmark} · {mt.powerBalance}
        </div>
      </div>
    </div>
  );
};
