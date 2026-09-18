import React from 'react';
import type { IModernTelemetryHub } from '../../types';
import { useTranslation } from '../../i18n';

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

  const mt = {
    biomechanicsTitle: t('proIntelligence.modernTelemetry.biomechanicsTitle', 'Biomechanical Orbital Rings'),
    biomechanicsSubtitle: t('proIntelligence.modernTelemetry.biomechanicsSubtitle', 'Workload ACWR & Recovery Reservoir'),
    energyTank: t('proIntelligence.modernTelemetry.energyTank', 'Energy Reservoir'),
    workloadRatio: t('proIntelligence.modernTelemetry.workloadRatio', 'Workload Ratio (ACWR)'),
    restClock: t('proIntelligence.modernTelemetry.restClock', 'Rest Window'),
    matches7d: t('proIntelligence.modernTelemetry.matches7d', '7-Day Match Volume'),
    mentalTitle: t('proIntelligence.modernTelemetry.mentalTitle', 'Quantum Mental Tension & Clutch Node'),
    mentalSubtitle: t('proIntelligence.modernTelemetry.mentalSubtitle', 'Bayesian Clutch Rating & Deciding Sets'),
    clutchRating: t('proIntelligence.modernTelemetry.clutchRating', 'Clutch Index'),
    comebackRate: t('proIntelligence.modernTelemetry.comebackRate', 'Comeback Rate'),
    frontRunner: t('proIntelligence.modernTelemetry.frontRunner', 'Front-Runner Win %'),
    tensionDelta: t('proIntelligence.modernTelemetry.tensionDelta', 'Mental Tension Delta'),
    courtDynamicsTitle: t('proIntelligence.modernTelemetry.courtDynamicsTitle', 'Court Pace & Surface ELO Velocity Arc'),
    courtDynamicsSubtitle: t('proIntelligence.modernTelemetry.courtDynamicsSubtitle', 'ITF Court Pace Index (CPI) & Surface Edge'),
    cpi: t('proIntelligence.modernTelemetry.cpi', 'Court Pace Index'),
    surfaceElo: t('proIntelligence.modernTelemetry.surfaceElo', 'Surface-Specific ELO'),
    surfaceAdvantage: t('proIntelligence.modernTelemetry.surfaceAdvantage', 'Surface Advantage'),
    synergyTitle: t('proIntelligence.modernTelemetry.synergyTitle', 'Total Synergy Clash (TSI)'),
    synergySubtitle: t('proIntelligence.modernTelemetry.synergySubtitle', 'Hold% + Break% Macroeconomic Benchmark'),
    tsiBenchmark: t('proIntelligence.modernTelemetry.tsiBenchmark', '105% Tour Benchmark'),
    dominanceRatio: t('proIntelligence.modernTelemetry.dominanceRatio', 'Dominance Ratio (DR)'),
    powerBalance: t('proIntelligence.modernTelemetry.powerBalance', 'Hold / Break Split'),
  };

  if (!data) return null;

  const { biomechanics, mental_clutch, court_dynamics, synergy_clash } = data;

  // Formatting helpers
  const p1Short = homeName.split(/\s+/).pop() || homeName;
  const p2Short = awayName.split(/\s+/).pop() || awayName;

  // SVG Circular Ring Helper
  const renderOrbitalRing = (
    pct: number,
    color: string,
    radius: number,
    strokeWidth: number,
    glowId: string
  ) => {
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(100, Math.max(0, pct)) / 100) * circumference;
    return (
      <svg
        className="w-full h-full transform -rotate-90 origin-center"
        viewBox="0 0 100 100"
      >
        {/* Background Track */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Active Arc */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter={`url(#${glowId})`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
    );
  };

  // ACWR pill color
  const getAcwrBadge = (acwr: number) => {
    if (acwr > 1.45) return { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', text: 'FATIGUE_RISK' };
    if (acwr >= 0.85 && acwr <= 1.35) return { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', text: 'OPTIMAL' };
    return { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', text: 'MODERATE_LOAD' };
  };

  const p1AcwrBadge = getAcwrBadge(biomechanics.p1_acwr);
  const p2AcwrBadge = getAcwrBadge(biomechanics.p2_acwr);

  // Status localization
  const localizeStatus = (statusKey: string) => {
    const key = (statusKey || '').toUpperCase();
    if (key.includes('PEAK')) return t('proIntelligence.modernTelemetry.statuses.peakReadiness', 'PEAK READINESS');
    if (key.includes('OPTIMAL')) return t('proIntelligence.modernTelemetry.statuses.optimal', 'OPTIMAL');
    if (key.includes('MODERATE')) return t('proIntelligence.modernTelemetry.statuses.moderateLoad', 'MODERATE LOAD');
    if (key.includes('RISK')) return t('proIntelligence.modernTelemetry.statuses.fatigueRisk', 'FATIGUE RISK');
    return t('proIntelligence.modernTelemetry.statuses.highFatigue', 'HIGH FATIGUE');
  };

  // Verdict localization
  const localizeVerdict = (verdictKey: string) => {
    const key = (verdictKey || '').toUpperCase();
    if (key.includes('ELITE')) return t('proIntelligence.modernTelemetry.verdicts.eliteClutch', 'ELITE CLUTCH');
    if (key.includes('RESOLUTE')) return t('proIntelligence.modernTelemetry.verdicts.resolute', 'RESOLUTE');
    if (key.includes('STEADY')) return t('proIntelligence.modernTelemetry.verdicts.steady', 'STEADY');
    return t('proIntelligence.modernTelemetry.verdicts.vulnerable', 'VULNERABLE');
  };

  // Tier localization
  const localizeTier = (tierKey: string) => {
    const key = (tierKey || '').toUpperCase();
    if (key.includes('ELITE')) return t('proIntelligence.modernTelemetry.tiers.elite', 'ELITE');
    if (key.includes('SOLID')) return t('proIntelligence.modernTelemetry.tiers.solid', 'SOLID');
    return t('proIntelligence.modernTelemetry.tiers.vulnerable', 'VULNERABLE');
  };

  // CPI Speed localization
  const localizeCpi = (cpiLabel: string) => {
    const key = (cpiLabel || '').toUpperCase();
    if (key.includes('SLOW')) return t('proIntelligence.modernTelemetry.cpiSpeeds.slow', 'Slow');
    if (key.includes('MEDIUM_FAST') || key.includes('MEDIUM FAST')) return t('proIntelligence.modernTelemetry.cpiSpeeds.mediumFast', 'Medium-Fast');
    if (key.includes('FAST')) return t('proIntelligence.modernTelemetry.cpiSpeeds.fast', 'Fast');
    return t('proIntelligence.modernTelemetry.cpiSpeeds.medium', 'Medium');
  };

  return (
    <div
      className={`space-y-4 text-slate-100 ${isRtl ? 'rtl' : 'ltr'} ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* SVG Filters for Laser Glow */}
      <svg className="hidden">
        <defs>
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#06b6d4" floodOpacity="0.8" />
          </filter>
          <filter id="glow-violet" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#a855f7" floodOpacity="0.8" />
          </filter>
          <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#f59e0b" floodOpacity="0.8" />
          </filter>
        </defs>
      </svg>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 1. BIOMECHANICAL ORBITAL RINGS                                     */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 p-4 border border-cyan-500/20 shadow-lg shadow-cyan-950/20 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              {mt.biomechanicsTitle}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">{mt.biomechanicsSubtitle}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Player 1 Orbit */}
          <div className="flex flex-col items-center bg-white/[0.02] p-3 rounded-xl border border-white/5 relative">
            <span className="text-xs font-semibold text-cyan-300 truncate max-w-[120px] mb-2">
              {p1Short}
            </span>
            <div className="relative w-24 h-24 flex items-center justify-center my-1">
              {renderOrbitalRing(biomechanics.p1_energy_tank_pct, '#06b6d4', 38, 6, 'glow-cyan')}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-lg font-black tracking-tight text-white">
                  {biomechanics.p1_energy_tank_pct}%
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-medium">
                  {mt.energyTank}
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="w-full mt-2 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between px-1">
                <span className="text-slate-400">{mt.workloadRatio}</span>
                <span className="font-mono font-bold text-cyan-300">{biomechanics.p1_acwr}</span>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-slate-400">{mt.restClock}</span>
                <span className="text-slate-200 font-medium">{biomechanics.p1_rest_label}</span>
              </div>
              <div className="pt-1 flex items-center justify-center">
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${p1AcwrBadge.bg}`}
                >
                  {localizeStatus(biomechanics.p1_status)}
                </span>
              </div>
            </div>
          </div>

          {/* Player 2 Orbit */}
          <div className="flex flex-col items-center bg-white/[0.02] p-3 rounded-xl border border-white/5 relative">
            <span className="text-xs font-semibold text-purple-300 truncate max-w-[120px] mb-2">
              {p2Short}
            </span>
            <div className="relative w-24 h-24 flex items-center justify-center my-1">
              {renderOrbitalRing(biomechanics.p2_energy_tank_pct, '#a855f7', 38, 6, 'glow-violet')}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-lg font-black tracking-tight text-white">
                  {biomechanics.p2_energy_tank_pct}%
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-medium">
                  {mt.energyTank}
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="w-full mt-2 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between px-1">
                <span className="text-slate-400">{mt.workloadRatio}</span>
                <span className="font-mono font-bold text-purple-300">{biomechanics.p2_acwr}</span>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-slate-400">{mt.restClock}</span>
                <span className="text-slate-200 font-medium">{biomechanics.p2_rest_label}</span>
              </div>
              <div className="pt-1 flex items-center justify-center">
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${p2AcwrBadge.bg}`}
                >
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 p-4 border border-purple-500/20 shadow-lg shadow-purple-950/20 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              {mt.mentalTitle}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">{mt.mentalSubtitle}</span>
        </div>

        {/* Tension Delta Clash Bar */}
        <div className="mb-4 bg-white/[0.02] p-3 rounded-xl border border-white/5">
          <div className="flex justify-between items-center text-xs mb-1.5 font-semibold">
            <div className="flex items-center gap-1.5 text-cyan-300">
              <span>{p1Short}</span>
              <span className="font-mono text-sm font-black">{mental_clutch.p1_clutch_rating10}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/30">
              {mt.clutchRating}
            </span>
            <div className="flex items-center gap-1.5 text-purple-300">
              <span className="font-mono text-sm font-black">{mental_clutch.p2_clutch_rating10}</span>
              <span>{p2Short}</span>
            </div>
          </div>

          {/* Bi-directional Duel Bar */}
          <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-700"
              style={{
                width: `${(mental_clutch.p1_clutch_score / (Math.max(1, mental_clutch.p1_clutch_score + mental_clutch.p2_clutch_score))) * 100}%`,
              }}
            />
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-700"
              style={{
                width: `${(mental_clutch.p2_clutch_score / (Math.max(1, mental_clutch.p1_clutch_score + mental_clutch.p2_clutch_score))) * 100}%`,
              }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] mt-1.5 font-medium text-slate-400">
            <span className="text-cyan-400/90">{localizeVerdict(mental_clutch.p1_verdict)}</span>
            <span>
              {mt.tensionDelta}: {mental_clutch.tension_delta > 0 ? `+${mental_clutch.tension_delta}` : mental_clutch.tension_delta}
            </span>
            <span className="text-purple-400/90">{localizeVerdict(mental_clutch.p2_verdict)}</span>
          </div>
        </div>

        {/* Comeback & Front Runner Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white/[0.02] p-2.5 rounded-lg border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">{mt.frontRunner}</span>
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-cyan-300">{mental_clutch.p1_front_runner_pct}%</span>
              <span className="text-slate-600 font-bold">vs</span>
              <span className="font-mono font-bold text-purple-300">{mental_clutch.p2_front_runner_pct}%</span>
            </div>
          </div>
          <div className="bg-white/[0.02] p-2.5 rounded-lg border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">{mt.comebackRate}</span>
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-cyan-300">{mental_clutch.p1_comeback_pct}%</span>
              <span className="text-slate-600 font-bold">vs</span>
              <span className="font-mono font-bold text-purple-300">{mental_clutch.p2_comeback_pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 3. COURT PACE & SURFACE ELO VELOCITY ARC                          */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 p-4 border border-amber-500/20 shadow-lg shadow-amber-950/20 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {mt.courtDynamicsTitle}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">{mt.courtDynamicsSubtitle}</span>
        </div>

        <div className="flex flex-col items-center justify-center bg-white/[0.02] p-3 rounded-xl border border-white/5 mb-3">
          {/* Surface & CPI Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {court_dynamics.surface}
            </span>
            <span className="text-xs text-slate-300 font-semibold">
              CPI: <strong className="text-white font-mono">{court_dynamics.cpi}</strong> (
              {localizeCpi(court_dynamics.cpi_label)})
            </span>
          </div>

          {/* ELO Velocity Clash */}
          <div className="w-full flex items-center justify-around mt-2">
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-cyan-300 truncate max-w-[100px]">
                {p1Short}
              </span>
              <span className="text-lg font-black font-mono text-white">
                {court_dynamics.p1_surface_elo}
              </span>
              <span className="text-[9px] text-slate-400 uppercase">{mt.surfaceElo}</span>
            </div>

            {/* Delta Node */}
            <div className="flex flex-col items-center px-3 py-1 bg-black/40 rounded-xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {mt.surfaceAdvantage}
              </span>
              <span
                className={`text-sm font-black font-mono ${
                  court_dynamics.elo_delta > 0
                    ? 'text-cyan-400'
                    : court_dynamics.elo_delta < 0
                    ? 'text-purple-400'
                    : 'text-slate-300'
                }`}
              >
                {court_dynamics.elo_delta > 0
                  ? `+${court_dynamics.elo_delta} P1`
                  : court_dynamics.elo_delta < 0
                  ? `+${Math.abs(court_dynamics.elo_delta)} P2`
                  : 'EVEN'}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-purple-300 truncate max-w-[100px]">
                {p2Short}
              </span>
              <span className="text-lg font-black font-mono text-white">
                {court_dynamics.p2_surface_elo}
              </span>
              <span className="text-[9px] text-slate-400 uppercase">{mt.surfaceElo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 4. TOTAL SYNERGY CLASH (TSI & DOMINANCE)                           */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 p-4 border border-emerald-500/20 shadow-lg shadow-emerald-950/20 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {mt.synergyTitle}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">{mt.synergySubtitle}</span>
        </div>

        {/* Dual Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* P1 Synergy */}
          <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 truncate max-w-[90px]">
                {p1Short}
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                  synergy_clash.p1_tier === 'ELITE'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                }`}
              >
                {localizeTier(synergy_clash.p1_tier)}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-[10px] text-slate-400 font-semibold">TSI (Hold+Break)</span>
              <span className="text-base font-black font-mono text-white">
                {synergy_clash.p1_tsi}%
              </span>
            </div>

            {/* Gauge relative to 105% Benchmark */}
            <div className="relative h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full"
                style={{ width: `${Math.min(100, (synergy_clash.p1_tsi / 115) * 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 pt-1">
              <span>DR: <strong className="text-cyan-300 font-mono">{synergy_clash.p1_dr.toFixed(2)}</strong></span>
              <span>{synergy_clash.p1_hold}% / {synergy_clash.p1_break}%</span>
            </div>
          </div>

          {/* P2 Synergy */}
          <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 truncate max-w-[90px]">
                {p2Short}
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                  synergy_clash.p2_tier === 'ELITE'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                }`}
              >
                {localizeTier(synergy_clash.p2_tier)}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-[10px] text-slate-400 font-semibold">TSI (Hold+Break)</span>
              <span className="text-base font-black font-mono text-white">
                {synergy_clash.p2_tsi}%
              </span>
            </div>

            {/* Gauge relative to 105% Benchmark */}
            <div className="relative h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-400 rounded-full"
                style={{ width: `${Math.min(100, (synergy_clash.p2_tsi / 115) * 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 pt-1">
              <span>DR: <strong className="text-purple-300 font-mono">{synergy_clash.p2_dr.toFixed(2)}</strong></span>
              <span>{synergy_clash.p2_hold}% / {synergy_clash.p2_break}%</span>
            </div>
          </div>
        </div>

        <div className="mt-3 text-center text-[10px] text-slate-500 font-medium">
          {mt.tsiBenchmark} · {mt.powerBalance}
        </div>
      </div>
    </div>
  );
};
