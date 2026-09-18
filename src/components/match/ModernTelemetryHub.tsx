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

  // Localized Labels
  const mt = {
    biomechanicsTitle: t('proIntelligence.modernTelemetry.biomechanicsTitle', 'Biomechanical Orbital Rings'),
    biomechanicsSubtitle: t('proIntelligence.modernTelemetry.biomechanicsSubtitle', 'Workload ACWR & Recovery'),
    energyTank: t('proIntelligence.modernTelemetry.energyTank', 'Energy Tank'),
    workloadRatio: t('proIntelligence.modernTelemetry.workloadRatio', 'Workload (ACWR)'),
    restClock: t('proIntelligence.modernTelemetry.restClock', 'Rest Window'),
    matches7d: t('proIntelligence.modernTelemetry.matches7d', '7-Day Matches'),
    mentalTitle: t('proIntelligence.modernTelemetry.mentalTitle', 'Quantum Mental Tension & Clutch Node'),
    mentalSubtitle: t('proIntelligence.modernTelemetry.mentalSubtitle', 'Bayesian Clutch Rating & Pressure'),
    clutchRating: t('proIntelligence.modernTelemetry.clutchRating', 'Clutch Index'),
    comebackRate: t('proIntelligence.modernTelemetry.comebackRate', 'Comeback Rate'),
    frontRunner: t('proIntelligence.modernTelemetry.frontRunner', '1st Set Lead Win %'),
    tensionDelta: t('proIntelligence.modernTelemetry.tensionDelta', 'Tension Delta'),
    courtDynamicsTitle: t('proIntelligence.modernTelemetry.courtDynamicsTitle', 'Court Pace & Surface ELO Arc'),
    courtDynamicsSubtitle: t('proIntelligence.modernTelemetry.courtDynamicsSubtitle', 'Official ITF Court Pace Index (CPI)'),
    cpi: t('proIntelligence.modernTelemetry.cpi', 'Court Pace Index'),
    surfaceElo: t('proIntelligence.modernTelemetry.surfaceElo', 'Surface ELO'),
    surfaceAdvantage: t('proIntelligence.modernTelemetry.surfaceAdvantage', 'Surface Edge'),
    synergyTitle: t('proIntelligence.modernTelemetry.synergyTitle', 'Total Synergy Clash (TSI)'),
    synergySubtitle: t('proIntelligence.modernTelemetry.synergySubtitle', 'Hold% + Break% Benchmark'),
    tsiBenchmark: t('proIntelligence.modernTelemetry.tsiBenchmark', '105% Tour Benchmark'),
    dominanceRatio: t('proIntelligence.modernTelemetry.dominanceRatio', 'Dominance Ratio (DR)'),
    powerBalance: t('proIntelligence.modernTelemetry.powerBalance', 'Hold / Break Split'),
  };

  const localizeStatus = (statusKey: string) => {
    const key = (statusKey || '').toUpperCase();
    if (key.includes('PEAK')) return t('proIntelligence.modernTelemetry.statuses.peakReadiness', 'PEAK READINESS');
    if (key.includes('OPTIMAL')) return t('proIntelligence.modernTelemetry.statuses.optimal', 'OPTIMAL');
    if (key.includes('MODERATE')) return t('proIntelligence.modernTelemetry.statuses.moderateLoad', 'MODERATE LOAD');
    if (key.includes('RISK')) return t('proIntelligence.modernTelemetry.statuses.fatigueRisk', 'FATIGUE RISK');
    return t('proIntelligence.modernTelemetry.statuses.highFatigue', 'HIGH FATIGUE');
  };

  const localizeVerdict = (verdictKey: string) => {
    const key = (verdictKey || '').toUpperCase();
    if (key.includes('ELITE')) return t('proIntelligence.modernTelemetry.verdicts.eliteClutch', 'ELITE CLUTCH');
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

  // Render Compact Orbital Ring
  const renderRing = (pct: number, color: string, glowColor: string) => {
    const size = 80;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const cleanPct = Math.min(100, Math.max(0, pct));
    const offset = circumference - (cleanPct / 100) * circumference;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
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
                transition: 'stroke-dashoffset 1s ease-out',
                filter: `drop-shadow(0 0 5px ${glowColor})`,
              }}
            />
          </svg>
          <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{cleanPct}%</span>
          </div>
        </div>
        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', marginTop: 4 }}>
          {mt.energyTank}
        </span>
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
      {/* 1. BIOMECHANICAL ORBITAL RINGS                                     */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.75), rgba(6, 12, 24, 0.9))',
          borderRadius: '14px',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          padding: '0.85rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.45rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} color="#06b6d4" />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {mt.biomechanicsTitle}
            </span>
          </div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)' }}>{mt.biomechanicsSubtitle}</span>
        </div>

        {/* Dual Player Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          {/* Player 1 Orbit */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(6, 182, 212, 0.15)', borderRadius: '10px', padding: '0.65rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', marginBottom: '0.35rem', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p1Short}
            </span>
            {renderRing(biomechanics.p1_energy_tank_pct, '#06b6d4', 'rgba(6, 182, 212, 0.6)')}

            <div style={{ width: '100%', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.66rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary, #cbd5e1)' }}>
                <span>{mt.workloadRatio}:</span>
                <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{biomechanics.p1_acwr}</strong>
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

          {/* Player 2 Orbit */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(168, 85, 247, 0.15)', borderRadius: '10px', padding: '0.65rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c084fc', marginBottom: '0.35rem', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p2Short}
            </span>
            {renderRing(biomechanics.p2_energy_tank_pct, '#a855f7', 'rgba(168, 85, 247, 0.6)')}

            <div style={{ width: '100%', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.66rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary, #cbd5e1)' }}>
                <span>{mt.workloadRatio}:</span>
                <strong style={{ color: '#c084fc', fontFamily: 'monospace' }}>{biomechanics.p2_acwr}</strong>
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
      {/* 2. QUANTUM MENTAL TENSION & CLUTCH NODE                            */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.75), rgba(6, 12, 24, 0.9))',
          borderRadius: '14px',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          padding: '0.85rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.45rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} color="#a855f7" />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {mt.mentalTitle}
            </span>
          </div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)' }}>{mt.mentalSubtitle}</span>
        </div>

        {/* Clash Bar */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '0.65rem', marginBottom: '0.55rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#38bdf8' }}>{p1Short}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{mental_clutch.p1_clutch_rating10}</span>
            </div>
            <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 99, background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
              {mt.clutchRating}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{mental_clutch.p2_clutch_rating10}</span>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#c084fc' }}>{p2Short}</span>
            </div>
          </div>

          {/* Duel Progress Bar */}
          <div style={{ height: 6, width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 99, overflow: 'hidden', display: 'flex' }}>
            <div
              style={{
                width: `${(mental_clutch.p1_clutch_score / Math.max(1, mental_clutch.p1_clutch_score + mental_clutch.p2_clutch_score)) * 100}%`,
                background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                height: '100%',
              }}
            />
            <div
              style={{
                width: `${(mental_clutch.p2_clutch_score / Math.max(1, mental_clutch.p1_clutch_score + mental_clutch.p2_clutch_score)) * 100}%`,
                background: 'linear-gradient(90deg, #a855f7, #c084fc)',
                height: '100%',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.62rem', marginTop: '5px', color: 'var(--text-muted, #94a3b8)' }}>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{localizeVerdict(mental_clutch.p1_verdict)}</span>
            <span>{mt.tensionDelta}: <strong style={{ color: '#fff' }}>{mental_clutch.tension_delta > 0 ? `+${mental_clutch.tension_delta}` : mental_clutch.tension_delta}</strong></span>
            <span style={{ color: '#c084fc', fontWeight: 700 }}>{localizeVerdict(mental_clutch.p2_verdict)}</span>
          </div>
        </div>

        {/* Lead & Comeback Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.66rem' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.45rem 0.6rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted, #94a3b8)', display: 'block', marginBottom: '2px' }}>{mt.frontRunner}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800 }}>
              <span style={{ color: '#38bdf8' }}>{mental_clutch.p1_front_runner_pct}%</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>vs</span>
              <span style={{ color: '#c084fc' }}>{mental_clutch.p2_front_runner_pct}%</span>
            </div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.45rem 0.6rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted, #94a3b8)', display: 'block', marginBottom: '2px' }}>{mt.comebackRate}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800 }}>
              <span style={{ color: '#38bdf8' }}>{mental_clutch.p1_comeback_pct}%</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>vs</span>
              <span style={{ color: '#c084fc' }}>{mental_clutch.p2_comeback_pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 3. COURT PACE & SURFACE ELO VELOCITY ARC                          */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.75), rgba(6, 12, 24, 0.9))',
          borderRadius: '14px',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          padding: '0.85rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.45rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Gauge size={14} color="#f59e0b" />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {mt.courtDynamicsTitle}
            </span>
          </div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)' }}>{mt.courtDynamicsSubtitle}</span>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '0.7rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Surface & CPI Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.55rem' }}>
            <span style={{ fontSize: '0.64rem', fontWeight: 900, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 99, background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
              {court_dynamics.surface}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #cbd5e1)' }}>
              CPI: <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{court_dynamics.cpi}</strong> ({localizeCpi(court_dynamics.cpi_label)})
            </span>
          </div>

          {/* ELO Clash */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '0.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8' }}>{p1Short}</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{court_dynamics.p1_surface_elo}</span>
              <span style={{ fontSize: '0.58rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>{mt.surfaceElo}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.35)', padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: '0.58rem', fontWeight: 800, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>{mt.surfaceAdvantage}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 900, fontFamily: 'monospace', color: court_dynamics.elo_delta > 0 ? '#38bdf8' : court_dynamics.elo_delta < 0 ? '#c084fc' : '#fff' }}>
                {court_dynamics.elo_delta > 0 ? `+${court_dynamics.elo_delta} ${p1Short}` : court_dynamics.elo_delta < 0 ? `+${Math.abs(court_dynamics.elo_delta)} ${p2Short}` : 'EVEN'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#c084fc' }}>{p2Short}</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{court_dynamics.p2_surface_elo}</span>
              <span style={{ fontSize: '0.58rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>{mt.surfaceElo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 4. TOTAL SYNERGY CLASH (TSI & DOMINANCE)                           */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.75), rgba(6, 12, 24, 0.9))',
          borderRadius: '14px',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          padding: '0.85rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.45rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={14} color="#10b981" />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {mt.synergyTitle}
            </span>
          </div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)' }}>{mt.synergySubtitle}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          {/* P1 Synergy Card */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(6, 182, 212, 0.15)', borderRadius: '10px', padding: '0.6rem 0.55rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8' }}>{p1Short}</span>
              <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '1px 5px', borderRadius: 4, background: synergy_clash.p1_tier === 'ELITE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.15)', color: synergy_clash.p1_tier === 'ELITE' ? '#34d399' : '#38bdf8', border: '1px solid rgba(255,255,255,0.1)' }}>
                {localizeTier(synergy_clash.p1_tier)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)' }}>TSI (H+B):</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{synergy_clash.p1_tsi}%</span>
            </div>

            <div style={{ height: 4, width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (synergy_clash.p1_tsi / 120) * 100)}%`, height: '100%', background: '#38bdf8', borderRadius: 2 }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)', marginTop: '2px' }}>
              <span>DR: <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{synergy_clash.p1_dr.toFixed(2)}</strong></span>
              <span>{synergy_clash.p1_hold}% / {synergy_clash.p1_break}%</span>
            </div>
          </div>

          {/* P2 Synergy Card */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(168, 85, 247, 0.15)', borderRadius: '10px', padding: '0.6rem 0.55rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#c084fc' }}>{p2Short}</span>
              <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '1px 5px', borderRadius: 4, background: synergy_clash.p2_tier === 'ELITE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(168, 85, 247, 0.15)', color: synergy_clash.p2_tier === 'ELITE' ? '#34d399' : '#c084fc', border: '1px solid rgba(255,255,255,0.1)' }}>
                {localizeTier(synergy_clash.p2_tier)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)' }}>TSI (H+B):</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{synergy_clash.p2_tsi}%</span>
            </div>

            <div style={{ height: 4, width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (synergy_clash.p2_tsi / 120) * 100)}%`, height: '100%', background: '#c084fc', borderRadius: 2 }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)', marginTop: '2px' }}>
              <span>DR: <strong style={{ color: '#c084fc', fontFamily: 'monospace' }}>{synergy_clash.p2_dr.toFixed(2)}</strong></span>
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
