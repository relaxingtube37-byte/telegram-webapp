import React, { useState, useMemo } from 'react';
import type { ProIntelligencePayload, IPlayerTelemetryCard, IMetricNode } from '../../types';
import { Sparkles, Shield, Zap, BatteryCharging, HeartHandshake, Activity, Award } from 'lucide-react';
import { useTranslation } from '../../i18n';

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

// 10 exact axes defined in the research paper (in clockwise order starting at 12 o'clock)
const RESEARCH_RADAR_AXES: { key: string; label: string; group: 'SERVE' | 'RETURN' | 'COMPOSITE' }[] = [
  { key: 'hold_rate', label: 'Serve Games (Hold %)', group: 'SERVE' },
  { key: 'first_serve_pts_won', label: '1st Serve Won %', group: 'SERVE' },
  { key: 'first_serve_accuracy', label: '1st Serve In %', group: 'SERVE' },
  { key: 'second_serve_pts_won', label: '2nd Serve Won %', group: 'SERVE' },
  { key: 'bps_saved', label: 'BPs Saved %', group: 'SERVE' },
  { key: 'tiebreaks_won', label: 'Tiebreaks Won %', group: 'COMPOSITE' },
  { key: 'break_rate', label: 'Return Games (Break %)', group: 'RETURN' },
  { key: 'return_1st_pts_won', label: 'Return 1st Pts %', group: 'RETURN' },
  { key: 'return_2nd_pts_won', label: 'Return 2nd Pts %', group: 'RETURN' },
  { key: 'bps_converted', label: 'BPs Converted %', group: 'RETURN' },
];

const AXIS_I18N_MAP: Record<string, string> = {
  hold_rate: 'proIntelligence.axes.holdRate',
  first_serve_pts_won: 'proIntelligence.axes.firstServePtsWon',
  first_serve_accuracy: 'proIntelligence.axes.firstServeAccuracy',
  second_serve_pts_won: 'proIntelligence.axes.secondServePtsWon',
  bps_saved: 'proIntelligence.axes.bpsSaved',
  tiebreaks_won: 'proIntelligence.axes.tiebreaksWon',
  break_rate: 'proIntelligence.axes.breakRate',
  return_1st_pts_won: 'proIntelligence.axes.return1stPtsWon',
  return_2nd_pts_won: 'proIntelligence.axes.return2ndPtsWon',
  bps_converted: 'proIntelligence.axes.bpsConverted',
};

function getPlayerLastName(fullName?: string, fallbackName?: string): string {
  const target = (fallbackName || fullName || '').trim();
  if (!target) return 'Player';
  const parts = target.split(/\s+/);
  if (parts.length === 1) return parts[0];
  if (parts[parts.length - 1].length <= 2) {
    return parts[0];
  }
  return parts[parts.length - 1];
}

function getPlayerFullName(fullName?: string, fallbackName?: string): string {
  if (fallbackName && fallbackName.length >= (fullName || '').length) return fallbackName;
  return fullName || 'Player';
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
  d1?: string;
  d2?: string;
}

function SymmetricalDualBar({ item, p1Color = '#38bdf8', p2Color = '#fb7185' }: { item: DualBarItem; p1Color?: string; p2Color?: string }) {
  const { t } = useTranslation();
  const p1Leads = item.r1 >= item.r2;
  const p2Leads = item.r2 >= item.r1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '3px 0' }}>
      {/* Metric Values & Center Label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
        {/* P1 Left: Percentage + Tour Index Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '85px' }}>
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
            color: p1Leads ? p1Color : 'rgba(255, 255, 255, 0.45)',
            background: p1Leads ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.06)',
            padding: '1px 5px',
            borderRadius: '4px',
            border: p1Leads ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid rgba(255, 255, 255, 0.08)',
          }} title={t('proIntelligence.tourRating', 'Tour Normalization Rating (40-100)')}>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', minWidth: '85px' }}>
          <span style={{
            fontSize: '0.62rem',
            fontWeight: 700,
            color: p2Leads ? p2Color : 'rgba(255, 255, 255, 0.45)',
            background: p2Leads ? 'rgba(244, 63, 94, 0.12)' : 'rgba(255, 255, 255, 0.06)',
            padding: '1px 5px',
            borderRadius: '4px',
            border: p2Leads ? '1px solid rgba(244, 63, 94, 0.25)' : '1px solid rgba(255, 255, 255, 0.08)',
          }} title={t('proIntelligence.tourRating', 'Tour Normalization Rating (40-100)')}>
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

const LEGACY_KEY_MAP: Record<string, string> = {
  hold_rate: 'serveGames',
  first_serve_pts_won: 'firstServePts',
  first_serve_accuracy: 'firstServeAcc',
  second_serve_pts_won: 'secondServePts',
  bps_saved: 'bpsSaved',
  tiebreaks_won: 'tbsWon',
  break_rate: 'returnGames',
  return_1st_pts_won: 'returnFirstPts',
  return_2nd_pts_won: 'returnSecondPts',
  bps_converted: 'returnBpsWon',
};

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
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'both' | 'p1' | 'p2'>('both');
  const [hoveredAxisIdx, setHoveredAxisIdx] = useState<number | null>(null);

  // Unwrap any nesting (e.g. { data: { ... } } or { payload: { ... } })
  const rawIntel: any = (intel as any)?.data || (intel as any)?.payload || (intel as any)?.proIntelligence || intel || {};
  const p1: IPlayerTelemetryCard = rawIntel.player_one || rawIntel.player1 || {} as any;
  const p2: IPlayerTelemetryCard = rawIntel.player_two || rawIntel.player2 || {} as any;
  const tourName = rawIntel.tour || rawIntel.meta?.tour || 'ATP';
  const surfaceName = rawIntel.surface || rawIntel.meta?.surface || surface || 'Official';

  const p1FullName = getPlayerFullName(p1.full_name || p1.name, homeName);
  const p2FullName = getPlayerFullName(p2.full_name || p2.name, awayName);
  const p1Short = getPlayerLastName(p1.full_name || p1.name, homeName);
  const p2Short = getPlayerLastName(p2.full_name || p2.name, awayName);

  // Helper to extract a metric node from player telemetry card (or legacy fallback)
  const getNode = (player: IPlayerTelemetryCard, key: string, customLegacyKey?: string): IMetricNode => {
    if (player.radar_axes && Array.isArray(player.radar_axes)) {
      const found = player.radar_axes.find((n) => n.key === key);
      if (found) return found;
    }
    // Legacy fallback mapping
    const legacyKey = customLegacyKey || LEGACY_KEY_MAP[key] || key;
    const legacyRadar = (player.radar as any) || {};
    const legacySkills = (player.skills as any) || {};

    let score = legacyRadar[legacyKey];
    if (score === undefined) {
      score = legacyRadar[key];
    }
    if (score === undefined) {
      score = (player as any)[legacyKey] ?? (player as any)[key];
    }
    if (score === undefined) {
      const fallbackDefaults: Record<string, number> = {
        hold_rate: 68,
        first_serve_pts_won: 64,
        first_serve_accuracy: 62,
        second_serve_pts_won: 48,
        bps_saved: 58,
        tiebreaks_won: 52,
        break_rate: 24,
        return_1st_pts_won: 32,
        return_2nd_pts_won: 51,
        bps_converted: 41,
      };
      score = fallbackDefaults[key] ?? 65;
    }

    const pctStr = legacySkills[`${legacyKey}Pct`] || legacySkills[`${key}Pct`] || `${score}%`;

    return {
      key,
      label: key,
      category: 'SERVE',
      raw_value: Number(score) / 100,
      display_string: pctStr,
      rating_score: Math.round(Number(score)),
      tour_delta_raw: 0,
      tour_delta_string: '0%',
    };
  };

  // SVG Geometry for 10-Axis Decagon (Section 6 from research paper)
  const svgWidth = 390;
  const svgHeight = 340;
  const centerX = svgWidth / 2; // 195
  const centerY = svgHeight / 2; // 170
  const maxRadius = 96;

  // Exact polar projection: theta_i = (2 * PI / 10) * i - PI / 2 (True North = 12 o'clock)
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

    if (index === 0) {
      return {
        x: centerX,
        y: centerY - maxRadius - 16,
        textAnchor: 'middle' as const,
        dominantBaseline: 'auto' as const,
      };
    }
    if (index === 5) {
      return {
        x: centerX,
        y: centerY + maxRadius + 22,
        textAnchor: 'middle' as const,
        dominantBaseline: 'hanging' as const,
      };
    }
    if (cosA > 0.1) {
      return {
        x: centerX + (maxRadius + 14) * cosA + 10,
        y: centerY + (maxRadius + 14) * sinA,
        textAnchor: 'start' as const,
        dominantBaseline: 'central' as const,
      };
    }
    return {
      x: centerX + (maxRadius + 14) * cosA - 10,
      y: centerY + (maxRadius + 14) * sinA,
      textAnchor: 'end' as const,
      dominantBaseline: 'central' as const,
    };
  };

  // Polygon points for Player 1 and Player 2
  const p1PolygonPoints = useMemo(() => {
    return RESEARCH_RADAR_AXES.map((axis, i) => {
      const node = getNode(p1, axis.key);
      const pt = getCoordinates(i, node.rating_score / 100);
      return `${pt.x},${pt.y}`;
    }).join(' ');
  }, [p1]);

  const p2PolygonPoints = useMemo(() => {
    return RESEARCH_RADAR_AXES.map((axis, i) => {
      const node = getNode(p2, axis.key);
      const pt = getCoordinates(i, node.rating_score / 100);
      return `${pt.x},${pt.y}`;
    }).join(' ');
  }, [p2]);

  // Concentric background decagon web rings (20%, 40%, 60%, 80%, 100%)
  const webRings = [0.2, 0.4, 0.6, 0.8, 1.0].map((level) => {
    return Array.from({ length: 10 }).map((_, i) => {
      const pt = getCoordinates(i, level);
      return `${pt.x},${pt.y}`;
    }).join(' ');
  });

  // Serve & Return Dual Bar Lists
  const serveItems: DualBarItem[] = [
    {
      label: t('proIntelligence.axes.holdRate', 'Service Games (Hold %)'),
      r1: getNode(p1, 'hold_rate').rating_score,
      r2: getNode(p2, 'hold_rate').rating_score,
      v1: getNode(p1, 'hold_rate').display_string,
      v2: getNode(p2, 'hold_rate').display_string,
      d1: getNode(p1, 'hold_rate').tour_delta_string,
      d2: getNode(p2, 'hold_rate').tour_delta_string,
    },
    {
      label: t('proIntelligence.axes.firstServePtsWon', '1st Serve Pts Won %'),
      r1: getNode(p1, 'first_serve_pts_won').rating_score,
      r2: getNode(p2, 'first_serve_pts_won').rating_score,
      v1: getNode(p1, 'first_serve_pts_won').display_string,
      v2: getNode(p2, 'first_serve_pts_won').display_string,
      d1: getNode(p1, 'first_serve_pts_won').tour_delta_string,
      d2: getNode(p2, 'first_serve_pts_won').tour_delta_string,
    },
    {
      label: t('proIntelligence.axes.firstServeAccuracy', '1st Serve Accuracy %'),
      r1: getNode(p1, 'first_serve_accuracy').rating_score,
      r2: getNode(p2, 'first_serve_accuracy').rating_score,
      v1: getNode(p1, 'first_serve_accuracy').display_string,
      v2: getNode(p2, 'first_serve_accuracy').display_string,
      d1: getNode(p1, 'first_serve_accuracy').tour_delta_string,
      d2: getNode(p2, 'first_serve_accuracy').tour_delta_string,
    },
    {
      label: t('proIntelligence.axes.secondServePtsWon', '2nd Serve Pts Won %'),
      r1: getNode(p1, 'second_serve_pts_won').rating_score,
      r2: getNode(p2, 'second_serve_pts_won').rating_score,
      v1: getNode(p1, 'second_serve_pts_won').display_string,
      v2: getNode(p2, 'second_serve_pts_won').display_string,
      d1: getNode(p1, 'second_serve_pts_won').tour_delta_string,
      d2: getNode(p2, 'second_serve_pts_won').tour_delta_string,
    },
    {
      label: t('proIntelligence.axes.bpsSaved', 'Break Points Saved %'),
      r1: getNode(p1, 'bps_saved').rating_score,
      r2: getNode(p2, 'bps_saved').rating_score,
      v1: getNode(p1, 'bps_saved').display_string,
      v2: getNode(p2, 'bps_saved').display_string,
      d1: getNode(p1, 'bps_saved').tour_delta_string,
      d2: getNode(p2, 'bps_saved').tour_delta_string,
    },
  ];

  const returnItems: DualBarItem[] = [
    {
      label: t('proIntelligence.axes.breakRate', 'Return Games (Break %)'),
      r1: getNode(p1, 'break_rate').rating_score,
      r2: getNode(p2, 'break_rate').rating_score,
      v1: getNode(p1, 'break_rate').display_string,
      v2: getNode(p2, 'break_rate').display_string,
      d1: getNode(p1, 'break_rate').tour_delta_string,
      d2: getNode(p2, 'break_rate').tour_delta_string,
    },
    {
      label: t('proIntelligence.axes.return1stPtsWon', 'Return 1st Pts Won %'),
      r1: getNode(p1, 'return_1st_pts_won').rating_score,
      r2: getNode(p2, 'return_1st_pts_won').rating_score,
      v1: getNode(p1, 'return_1st_pts_won').display_string,
      v2: getNode(p2, 'return_1st_pts_won').display_string,
      d1: getNode(p1, 'return_1st_pts_won').tour_delta_string,
      d2: getNode(p2, 'return_1st_pts_won').tour_delta_string,
    },
    {
      label: t('proIntelligence.axes.return2ndPtsWon', 'Return 2nd Pts Won %'),
      r1: getNode(p1, 'return_2nd_pts_won').rating_score,
      r2: getNode(p2, 'return_2nd_pts_won').rating_score,
      v1: getNode(p1, 'return_2nd_pts_won').display_string,
      v2: getNode(p2, 'return_2nd_pts_won').display_string,
      d1: getNode(p1, 'return_2nd_pts_won').tour_delta_string,
      d2: getNode(p2, 'return_2nd_pts_won').tour_delta_string,
    },
    {
      label: t('proIntelligence.axes.bpsConverted', 'Break Points Converted %'),
      r1: getNode(p1, 'bps_converted').rating_score,
      r2: getNode(p2, 'bps_converted').rating_score,
      v1: getNode(p1, 'bps_converted').display_string,
      v2: getNode(p2, 'bps_converted').display_string,
      d1: getNode(p1, 'bps_converted').tour_delta_string,
      d2: getNode(p2, 'bps_converted').tour_delta_string,
    },
    {
      label: t('proIntelligence.axes.tiebreaksWon', 'Tiebreaks Won % (Bayes Adj.)'),
      r1: getNode(p1, 'tiebreaks_won').rating_score,
      r2: getNode(p2, 'tiebreaks_won').rating_score,
      v1: getNode(p1, 'tiebreaks_won').display_string,
      v2: getNode(p2, 'tiebreaks_won').display_string,
      d1: getNode(p1, 'tiebreaks_won').tour_delta_string,
      d2: getNode(p2, 'tiebreaks_won').tour_delta_string,
    },
  ];

  // Dynamic calculation of Dominance Ratio & TSI for legacy or missing composites
  const calcLegacyDr = (player: any) => {
    const radar = player?.radar || {};
    const firstPts = Number(radar.firstServePts || 64);
    const retPts = Number(radar.returnFirstPts || 32);
    const dr = ((firstPts + retPts) / 95).toFixed(2);
    const score = Math.min(99, Math.max(45, Math.round(Number(dr) * 68)));
    return { display_string: dr, rating_score: score, tour_delta_string: '+0.00' };
  };

  const calcLegacyTsi = (player: any) => {
    const radar = player?.radar || {};
    const hold = Number(radar.serveGames || 68);
    const brk = Number(radar.returnGames || 24);
    const tsi = (hold + brk).toFixed(1);
    const score = Math.min(99, Math.max(45, Math.round((Number(tsi) / 100) * 80)));
    return { display_string: tsi, rating_score: score, tour_delta_string: '+0.0' };
  };

  const calcLegacyOverall = (player: any) => {
    if (player?.composites?.overall_rating) return player.composites.overall_rating;
    if (player?.rank && player.rank < 100) return Math.max(76, 96 - Math.round(player.rank / 4));
    const radar = player?.radar || {};
    const vals = Object.values(radar).filter((v): v is number => typeof v === 'number');
    if (vals.length > 0) {
      return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    }
    return 74;
  };

  const p1Dr = p1.composites?.dominance_ratio || calcLegacyDr(p1);
  const p2Dr = p2.composites?.dominance_ratio || calcLegacyDr(p2);
  const p1Tsi = p1.composites?.match_efficiency || calcLegacyTsi(p1);
  const p2Tsi = p2.composites?.match_efficiency || calcLegacyTsi(p2);

  const p1Overall = p1.composites?.overall_rating || calcLegacyOverall(p1);
  const p2Overall = p2.composites?.overall_rating || calcLegacyOverall(p2);

  const getReadinessLabel = (rawStatus?: string): string => {
    if (!rawStatus) return '';
    const norm = rawStatus.toUpperCase().replace(/\s+/g, '_');
    switch (norm) {
      case 'PEAK_READINESS':
        return t('proIntelligence.readiness.peakReadiness', 'PEAK READINESS');
      case 'OPTIMAL':
        return t('proIntelligence.readiness.optimal', 'OPTIMAL');
      case 'MODERATE_LOAD':
        return t('proIntelligence.readiness.moderateLoad', 'MODERATE LOAD');
      case 'HIGH_FATIGUE':
        return t('proIntelligence.readiness.highFatigue', 'HIGH FATIGUE');
      case 'FRESH':
        return t('analyticsGrid.fresh', 'Fresh');
      default:
        return rawStatus.replace(/_/g, ' ');
    }
  };

  const getMentalVerdict = (rawVerdict?: string): string => {
    if (!rawVerdict) return '';
    const norm = rawVerdict.toUpperCase().replace(/\s+/g, '_');
    switch (norm) {
      case 'ELITE_CLUTCH':
        return t('proIntelligence.mental.eliteClutch', 'ELITE CLUTCH');
      case 'RESOLUTE':
        return t('proIntelligence.mental.resolute', 'RESOLUTE');
      case 'STEADY':
        return t('proIntelligence.mental.steady', 'STEADY');
      case 'VULNERABLE':
        return t('proIntelligence.mental.vulnerable', 'VULNERABLE');
      default:
        return rawVerdict.replace(/_/g, ' ');
    }
  };

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
              <span>{tourName} {t('proIntelligence.tourSkillsRadar', 'TOUR SKILLS & PERFORMANCE RADAR')}</span>
              <span style={{ fontSize: '0.65rem', background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', padding: '2px 7px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                {surfaceName}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {t('proIntelligence.radarSubtitle', '10-Axis Decagon Spider Radar · 52-Week EWMA (90d Half-Life) & Empirical Bayes Normalization')}
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
            {t('proIntelligence.h2hOverlay', 'H2H Overlay')}
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
            {p1Short} ({p1Overall})
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
            {p2Short} ({p2Overall})
          </button>
        </div>
      </div>

      {/* ── Subheader: Dual Player Form & Master Rating Capsule ── */}
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
          <span style={{ fontSize: '0.65rem', background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', padding: '1px 6px', borderRadius: 4, fontWeight: 900 }}>
            ★ {p1Overall}
          </span>
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
            <span>{t('deepAnalytics.h2h', 'H2H:')} <strong style={{ color: '#fff' }}>{h2hSummary.p1Wins} - {h2hSummary.p2Wins}</strong></span>
          ) : (
            <span style={{ color: '#38bdf8' }}>{t('proIntelligence.tourSkillsClash', 'Tour Skills Clash')}</span>
          )}
        </div>

        {/* P2 Form Right */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          {p2Form?.recentScores && <FormPills scores={p2Form.recentScores} />}
          <span style={{ fontSize: '0.65rem', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', padding: '1px 6px', borderRadius: 4, fontWeight: 900 }}>
            ★ {p2Overall}
          </span>
          <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#fb7185' }}>{p2FullName}</span>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e', display: 'inline-block' }} />
        </div>
      </div>

      {/* ── Main 2-Column Layout: Radar Left, Progress Bars Right ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
        gap: '1.5rem',
        alignItems: 'center',
      }}>
        {/* Left Column: Pure SVG 10-Axis Decagon Spider Radar (Section 6) */}
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
              {/* Neon Glow Filters */}
              <filter id="glowP1" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glowP2" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Concentric Decagon Web Rings at 20%, 40%, 60%, 80%, 100% */}
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

            {/* 10 Spoke Structural Axes */}
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
                filter="url(#glowP2)"
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

            {/* Vertices & Axis Labels */}
            {RESEARCH_RADAR_AXES.map((axis, i) => {
              const labelPos = getLabelProps(i);
              const nodeP1 = getNode(p1, axis.key);
              const nodeP2 = getNode(p2, axis.key);
              const vP1 = getCoordinates(i, nodeP1.rating_score / 100);
              const vP2 = getCoordinates(i, nodeP2.rating_score / 100);

              const isHovered = hoveredAxisIdx === i;

              return (
                <g
                  key={i}
                  onMouseEnter={() => setHoveredAxisIdx(i)}
                  onMouseLeave={() => setHoveredAxisIdx(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* P2 vertex dot */}
                  {(viewMode === 'both' || viewMode === 'p2') && (
                    <circle cx={vP2.x} cy={vP2.y} r="3.5" fill="#f43f5e" stroke="#fff" strokeWidth="1" />
                  )}

                  {/* P1 vertex dot */}
                  {(viewMode === 'both' || viewMode === 'p1') && (
                    <circle cx={vP1.x} cy={vP1.y} r="4" fill="#06b6d4" stroke="#fff" strokeWidth="1.5" />
                  )}

                  {/* Outer Axis Label text */}
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor={labelPos.textAnchor}
                    dominantBaseline={labelPos.dominantBaseline}
                    fill={isHovered ? '#38bdf8' : 'rgba(255, 255, 255, 0.85)'}
                    fontSize="9.5"
                    fontWeight={isHovered ? 800 : 600}
                    style={{
                      transition: 'all 0.2s ease',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.9)',
                    }}
                  >
                    {t(AXIS_I18N_MAP[axis.key] || '', axis.label)}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredAxisIdx !== null && (
            <div style={{
              position: 'absolute',
              bottom: 40,
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.72rem',
              color: '#fff',
              pointerEvents: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
            }}>
              <span style={{ fontWeight: 800, color: '#38bdf8' }}>{t(AXIS_I18N_MAP[RESEARCH_RADAR_AXES[hoveredAxisIdx].key] || '', RESEARCH_RADAR_AXES[hoveredAxisIdx].label)}:</span>
              <span>{p1Short}: <strong>{getNode(p1, RESEARCH_RADAR_AXES[hoveredAxisIdx].key).display_string}</strong> ({getNode(p1, RESEARCH_RADAR_AXES[hoveredAxisIdx].key).tour_delta_string})</span>
              <span>{p2Short}: <strong>{getNode(p2, RESEARCH_RADAR_AXES[hoveredAxisIdx].key).display_string}</strong> ({getNode(p2, RESEARCH_RADAR_AXES[hoveredAxisIdx].key).tour_delta_string})</span>
            </div>
          )}

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#06b6d4', display: 'inline-block', boxShadow: '0 0 8px #06b6d4' }} />
              <span style={{ color: '#fff', fontWeight: 800 }}>{p1FullName} ({p1Overall})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f43f5e', display: 'inline-block', boxShadow: '0 0 8px #f43f5e' }} />
              <span style={{ color: '#fff', fontWeight: 800 }}>{p2FullName} ({p2Overall})</span>
            </div>
          </div>
        </div>

        {/* Right Column: Symmetrical Skill Rating Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
          {/* Serve Group */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.95rem', borderRadius: '14px', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
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
                <Zap size={13} /> {t('proIntelligence.serveMastery', 'Serve Mastery (5 Pillars)')}
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
                <Shield size={13} /> {t('proIntelligence.returnMastery', 'Return & Pressure (5 Pillars)')}
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

          {/* Overall Macroeconomic Composites: Dominance Ratio & TSI (Section 4) */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.025)',
            padding: '0.95rem',
            borderRadius: '14px',
            border: '1px solid rgba(234, 179, 8, 0.25)',
          }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Activity size={14} /> {t('proIntelligence.macroComposites', 'Macroeconomic Composites: Dominance Ratio & Total Synergy')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              {/* Player 1 */}
              <div style={{ background: 'rgba(6, 182, 212, 0.06)', padding: '0.75rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#38bdf8' }}>{p1Short}</span>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', padding: '1px 5px', borderRadius: 3, fontWeight: 900 }}>{t('proIntelligence.master', 'Master')} {p1Overall}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  <span>{t('proIntelligence.dominanceRatio', 'Dominance Ratio (DR)')}</span>
                  <strong style={{ color: '#fff' }}>{p1Dr.display_string} ({p1Dr.rating_score})</strong>
                </div>
                <div style={{ height: 4, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 2, marginBottom: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, p1Dr.rating_score)}%`, height: '100%', background: '#06b6d4', borderRadius: 2 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  <span>{t('proIntelligence.totalSynergy', 'Total Synergy (TSI)')}</span>
                  <strong style={{ color: '#fff' }}>{p1Tsi.display_string} ({p1Tsi.rating_score})</strong>
                </div>
                <div style={{ height: 4, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, p1Tsi.rating_score)}%`, height: '100%', background: '#3b82f6', borderRadius: 2 }} />
                </div>
              </div>

              {/* Player 2 */}
              <div style={{ background: 'rgba(244, 63, 94, 0.06)', padding: '0.75rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#fb7185' }}>{p2Short}</span>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(244, 63, 94, 0.2)', color: '#fb7185', padding: '1px 5px', borderRadius: 3, fontWeight: 900 }}>{t('proIntelligence.master', 'Master')} {p2Overall}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  <span>{t('proIntelligence.dominanceRatio', 'Dominance Ratio (DR)')}</span>
                  <strong style={{ color: '#fff' }}>{p2Dr.display_string} ({p2Dr.rating_score})</strong>
                </div>
                <div style={{ height: 4, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 2, marginBottom: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, p2Dr.rating_score)}%`, height: '100%', background: '#f43f5e', borderRadius: 2 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  <span>{t('proIntelligence.totalSynergy', 'Total Synergy (TSI)')}</span>
                  <strong style={{ color: '#fff' }}>{p2Tsi.display_string} ({p2Tsi.rating_score})</strong>
                </div>
                <div style={{ height: 4, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, p2Tsi.rating_score)}%`, height: '100%', background: '#ec4899', borderRadius: 2 }} />
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
            <span style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: 4, background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', fontWeight: 800 }}>{t('proIntelligence.player1', 'PLAYER 1')}</span>
          </div>

          {p1.readiness && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BatteryCharging size={18} color="#22c55e" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>
                  <span style={{ color: '#22c55e' }}>{getReadinessLabel(p1.readiness.statusLabel)} ({p1.readiness.energyScore}%)</span>
                </div>
                <div style={{ height: 3, width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 2, margin: '3px 0', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p1.readiness.energyScore}%`, background: '#22c55e', borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {t('proIntelligence.restWindow', 'Rest Window')}: {p1.readiness.restLabel}
                </div>
              </div>
            </div>
          )}

          {p1.mental && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <HeartHandshake size={18} color="#06b6d4" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>
                  <span style={{ color: '#38bdf8' }}>{getMentalVerdict(p1.mental.verdict)}</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {t('proIntelligence.firstSetLeadWin', '1st Set Lead Win')}: {p1.mental.frontRunnerWinPct} · {t('proIntelligence.comebackRate', 'Comeback Rate')}: {p1.mental.comebackRatePct}
                </div>
              </div>
            </div>
          )}
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
            <span style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: 4, background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', fontWeight: 800 }}>{t('proIntelligence.player2', 'PLAYER 2')}</span>
          </div>

          {p2.readiness && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BatteryCharging size={18} color="#22c55e" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>
                  <span style={{ color: '#22c55e' }}>{getReadinessLabel(p2.readiness.statusLabel)} ({p2.readiness.energyScore}%)</span>
                </div>
                <div style={{ height: 3, width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 2, margin: '3px 0', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p2.readiness.energyScore}%`, background: '#22c55e', borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {t('proIntelligence.restWindow', 'Rest Window')}: {p2.readiness.restLabel}
                </div>
              </div>
            </div>
          )}

          {p2.mental && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <HeartHandshake size={18} color="#f43f5e" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>
                  <span style={{ color: '#f472b6' }}>{getMentalVerdict(p2.mental.verdict)}</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {t('proIntelligence.firstSetLeadWin', '1st Set Lead Win')}: {p2.mental.frontRunnerWinPct} · {t('proIntelligence.comebackRate', 'Comeback Rate')}: {p2.mental.comebackRatePct}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
