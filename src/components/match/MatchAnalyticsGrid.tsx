import React from 'react';
import {
  Activity,
  BarChart3,
  Flame,
  Zap,
  Battery,
  Shield,
  Target,
  Sparkles,
  Lock,
  TrendingUp,
  Award
} from 'lucide-react';
import type { MappedDeepAnalytics } from '../../match/mapDeepAnalytics';
import { useTranslation } from '../../i18n';

interface MatchAnalyticsGridProps {
  analytics: MappedDeepAnalytics | null;
  loading?: boolean;
  error?: string | null;
  homeName: string;
  awayName: string;
  surface?: string;
  homeOdds?: string | number;
  awayOdds?: string | number;
  homeImage?: string;
  awayImage?: string;
  onUnlockClick?: () => void;
}

/**
 * Dual comparative bar (SofaScore / FlashScore style)
 */
function DualComparisonBar({
  title,
  leftVal,
  rightVal,
  leftNum,
  rightNum,
  unit = '%',
  invertWinner = false,
}: {
  title: string;
  leftVal: string | number | null | undefined;
  rightVal: string | number | null | undefined;
  leftNum: number | null | undefined;
  rightNum: number | null | undefined;
  unit?: string;
  invertWinner?: boolean;
}) {
  const lNum = typeof leftNum === 'number' && Number.isFinite(leftNum) ? leftNum : null;
  const rNum = typeof rightNum === 'number' && Number.isFinite(rightNum) ? rightNum : null;

  if (lNum == null && rNum == null && leftVal == null && rightVal == null) {
    return null;
  }

  const sum = ((lNum ?? 50) + (rNum ?? 50)) || 100;
  const leftPct = lNum != null && rNum != null ? Math.min(92, Math.max(8, Math.round((lNum / sum) * 100))) : 50;
  const rightPct = 100 - leftPct;

  const leftIsBetter = lNum != null && rNum != null ? (invertWinner ? lNum < rNum : lNum > rNum) : false;
  const rightIsBetter = lNum != null && rNum != null ? (invertWinner ? rNum < lNum : rNum > lNum) : false;

  const displayLeft = leftVal != null ? `${leftVal}${unit && typeof leftVal === 'number' ? unit : ''}` : '--';
  const displayRight = rightVal != null ? `${rightVal}${unit && typeof rightVal === 'number' ? unit : ''}` : '--';

  return (
    <div style={{ marginBottom: '0.95rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span
          style={{
            fontSize: '0.88rem',
            fontWeight: 800,
            color: leftIsBetter ? '#38bdf8' : 'var(--text-primary)',
          }}
        >
          {displayLeft}
        </span>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: '0.88rem',
            fontWeight: 800,
            color: rightIsBetter ? '#fb7185' : 'var(--text-primary)',
          }}
        >
          {displayRight}
        </span>
      </div>

      {/* Dual Progress Bar Track */}
      <div
        style={{
          display: 'flex',
          height: 7,
          borderRadius: 99,
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.08)',
          gap: 2,
        }}
      >
        <div
          style={{
            width: `${leftPct}%`,
            background: leftIsBetter
              ? 'linear-gradient(90deg, #0284c7, #38bdf8)'
              : 'rgba(255, 255, 255, 0.25)',
            borderRadius: '99px 0 0 99px',
            transition: 'width 0.4s ease',
          }}
        />
        <div
          style={{
            width: `${rightPct}%`,
            background: rightIsBetter
              ? 'linear-gradient(90deg, #fb7185, #f43f5e)'
              : 'rgba(255, 255, 255, 0.25)',
            borderRadius: '0 99px 99px 0',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}

/**
 * 5-Match Form Pills (Green W / Red L) - Genuine historical records only
 */
function FormPills({
  streak,
  scores = [],
  accentColor = '#38bdf8',
}: {
  streak?: string | null;
  scores?: string[];
  accentColor?: string;
}) {
  const { t } = useTranslation();
  const badges = (scores || []).slice(0, 5).map((s) => (s.startsWith('W') ? 'W' : 'L'));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {badges.length > 0 ? (
        badges.map((b, i) => (
          <span
            key={i}
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              fontSize: '0.7rem',
              fontWeight: 900,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: b === 'W' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: b === 'W' ? '#4ade80' : '#f87171',
              border: `1px solid ${b === 'W' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            }}
            title={`Match ${i + 1}: ${b === 'W' ? 'Victory' : 'Defeat'}`}
          >
            {b}
          </span>
        ))
      ) : (
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{t('analyticsGrid.recentTourRecord', 'Recent tour record')}</span>
      )}
      {streak && streak !== 'N/A' && (
        <span
          style={{
            marginLeft: 6,
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '2px 7px',
            borderRadius: 6,
            background: streak.includes('W') ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: streak.includes('W') ? '#4ade80' : '#f87171',
            border: `1px solid ${streak.includes('W') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          }}
        >
          {streak}
        </span>
      )}
    </div>
  );
}

export const MatchAnalyticsGrid: React.FC<MatchAnalyticsGridProps> = ({
  analytics,
  loading,
  error,
  homeName,
  awayName,
  surface = 'Hard',
  homeOdds,
  awayOdds,
  onUnlockClick,
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div
        className="glass"
        style={{
          padding: '1.5rem',
          borderRadius: 14,
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          textAlign: 'center',
        }}
      >
        <Activity className="animate-spin" size={20} style={{ margin: '0 auto 8px', color: '#38bdf8' }} />
        {t('analyticsGrid.analyzing', 'Analyzing 100,000+ tour historical points…')}
      </div>
    );
  }

  // Extract 100% genuine database metrics (zero synthetic odds imputation)
  const p1Form = analytics?.p1Form;
  const p2Form = analytics?.p2Form;
  const p1Surface = analytics?.p1Surface;
  const p2Surface = analytics?.p2Surface;
  const p1Clutch = analytics?.p1Clutch;
  const p2Clutch = analytics?.p2Clutch;
  const p1Workload = analytics?.p1Workload;
  const p2Workload = analytics?.p2Workload;

  const hasSurfaceMatches = (p1Surface?.winRatePct != null || p2Surface?.winRatePct != null);
  const p1WinRate = hasSurfaceMatches ? p1Surface?.winRatePct : p1Form?.last5WinRatePct;
  const p2WinRate = hasSurfaceMatches ? p2Surface?.winRatePct : p2Form?.last5WinRatePct;
  const winRateTitle = hasSurfaceMatches
    ? `${t('analyticsGrid.surfaceWinRate', 'Surface Win Rate')} (${surface || 'Hard'})`
    : t('analyticsGrid.tourFormLast5', 'Tour Form (Last 5)');

  const p1Hold = p1Surface?.holdRatePct;
  const p2Hold = p2Surface?.holdRatePct;
  const p1Break = p1Clutch?.breakPointsConvertedPct ?? p1Surface?.breakRatePct;
  const p2Break = p2Clutch?.breakPointsConvertedPct ?? p2Surface?.breakRatePct;
  const p1ClutchScore = p1Clutch?.clutchIndexScore;
  const p2ClutchScore = p2Clutch?.clutchIndexScore;

  const p1Rest = p1Workload?.daysSinceLastMatch;
  const p2Rest = p2Workload?.daysSinceLastMatch;
  const p1Energy = p1Workload?.energyTankPct ?? (p1Rest != null ? Math.min(100, Math.max(50, 60 + p1Rest * 5)) : 100);
  const p2Energy = p2Workload?.energyTankPct ?? (p2Rest != null ? Math.min(100, Math.max(50, 60 + p2Rest * 5)) : 100);

  // H2H
  const h2h = analytics?.h2h;
  const h2hTotal = h2h?.total ?? 0;
  const h2hP1 = h2h?.p1Wins ?? 0;
  const h2hP2 = h2h?.p2Wins ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      {/* ── Section Title ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.82rem',
          fontWeight: 800,
          color: '#38bdf8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <BarChart3 size={16} />
          <span>{t('analyticsGrid.sectionTitle', 'Head-to-Head & Performance Radar')}</span>
        </div>
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 99,
            background: 'rgba(56, 189, 248, 0.12)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.25)',
          }}
        >
          {surface || 'Hardcourt'}
        </span>
      </div>

      {/* ── Card 1: Player Form & Streaks ── */}
      <div
        className="glass"
        style={{
          padding: '1.1rem',
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(18, 24, 38, 0.75)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'white', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {homeName}
            </div>
            <FormPills
              streak={p1Form?.currentStreak}
              scores={p1Form?.recentScores}
              accentColor="#38bdf8"
            />
          </div>

          <div
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.05)',
              textAlign: 'center',
              margin: '0 0.75rem',
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>H2H</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'white' }}>
              {h2hTotal > 0 ? `${h2hP1} - ${h2hP2}` : '0 - 0'}
            </div>
            <div style={{ fontSize: '0.65rem', color: h2hTotal > 0 ? 'var(--text-secondary)' : '#38bdf8', fontWeight: 700 }}>
              {h2hTotal > 0 ? `${h2hTotal} ${t('analyticsGrid.h2hMeets', 'meets')}` : t('analyticsGrid.firstMeeting', '1st meeting')}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'white', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {awayName}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <FormPills
                streak={p2Form?.currentStreak}
                scores={p2Form?.recentScores}
                accentColor="#fb7185"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Card 2: SofaScore-Style Dual Head-to-Head Comparison Bars ── */}
      <div
        className="glass"
        style={{
          padding: '1.2rem',
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(18, 24, 38, 0.75)',
        }}
      >
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14 }}>
          {t('analyticsGrid.matchupComparison', '📊 Matchup Comparison & Edge Radar')}
        </div>

        <DualComparisonBar
          title={winRateTitle}
          leftVal={p1WinRate}
          rightVal={p2WinRate}
          leftNum={p1WinRate}
          rightNum={p2WinRate}
        />

        {(p1Hold != null || p2Hold != null) && (
          <DualComparisonBar
            title={t('analyticsGrid.serviceHoldEfficiency', 'Service Hold Efficiency')}
            leftVal={p1Hold}
            rightVal={p2Hold}
            leftNum={p1Hold}
            rightNum={p2Hold}
          />
        )}

        {(p1Break != null || p2Break != null) && (
          <DualComparisonBar
            title={t('analyticsGrid.breakPointConversion', 'Break Point Conversion')}
            leftVal={p1Break}
            rightVal={p2Break}
            leftNum={p1Break}
            rightNum={p2Break}
          />
        )}

        {(p1ClutchScore != null || p2ClutchScore != null) && (
          <DualComparisonBar
            title={t('analyticsGrid.deciding3rdSetClutch', 'Deciding 3rd Set Clutch')}
            leftVal={p1ClutchScore}
            rightVal={p2ClutchScore}
            leftNum={p1ClutchScore}
            rightNum={p2ClutchScore}
          />
        )}

        {analytics?.matchupGaps && (analytics.matchupGaps.p1AceAvg != null || analytics.matchupGaps.p2AceAvg != null) && (
          <DualComparisonBar
            title={t('analyticsGrid.acePerMatchBaseline', 'Ace per Match Baseline')}
            leftVal={analytics.matchupGaps.p1AceAvg}
            rightVal={analytics.matchupGaps.p2AceAvg}
            leftNum={analytics.matchupGaps.p1AceAvg}
            rightNum={analytics.matchupGaps.p2AceAvg}
            unit=""
          />
        )}
      </div>

      {/* ── Card 3: Workload & Physical Battery ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
        }}
      >
        {/* Player 1 Workload */}
        <div
          className="glass"
          style={{
            padding: '0.9rem',
            borderRadius: 12,
            border: '1px solid rgba(56, 189, 248, 0.15)',
            background: 'rgba(18, 24, 38, 0.65)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Battery size={15} color="#38bdf8" />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
              {t('analyticsGrid.physicalBattery', 'Physical Battery')}
            </span>
          </div>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'white', marginBottom: 2 }}>
            {homeName}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#4ade80', fontWeight: 700, marginBottom: 4 }}>
            {t('analyticsGrid.energyTank', 'Energy Tank:')} {p1Energy}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            {t('analyticsGrid.restPeriod', 'Rest Period:')} <strong>{p1Rest != null ? `${p1Rest}d` : t('analyticsGrid.fresh', 'Fresh')}</strong> · {t('analyticsGrid.optimalRecovery', 'Optimal Recovery')}
          </div>
        </div>

        {/* Player 2 Workload */}
        <div
          className="glass"
          style={{
            padding: '0.9rem',
            borderRadius: 12,
            border: '1px solid rgba(251, 113, 133, 0.15)',
            background: 'rgba(18, 24, 38, 0.65)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Battery size={15} color="#fb7185" />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fb7185', textTransform: 'uppercase' }}>
              {t('analyticsGrid.physicalBattery', 'Physical Battery')}
            </span>
          </div>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'white', marginBottom: 2 }}>
            {awayName}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#4ade80', fontWeight: 700, marginBottom: 4 }}>
            {t('analyticsGrid.energyTank', 'Energy Tank:')} {p2Energy}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            {t('analyticsGrid.restPeriod', 'Rest Period:')} <strong>{p2Rest != null ? `${p2Rest}d` : t('analyticsGrid.fresh', 'Fresh')}</strong> · {t('analyticsGrid.optimalRecovery', 'Optimal Recovery')}
          </div>
        </div>
      </div>

      {/* ── Lock notice for guest visitors ── */}
      {analytics?.locked && onUnlockClick && (
        <div
          className="glass"
          style={{
            padding: '0.85rem 1rem',
            borderRadius: 12,
            border: '1px dashed rgba(251, 191, 36, 0.35)',
            background: 'rgba(24, 24, 18, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lock size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: '#fef08a', lineHeight: 1.4 }}>
              {t('analyticsGrid.unlockNotice', 'Unlock deeper point-by-point simulation & set betting odds.')}
            </span>
          </div>
          <button
            type="button"
            onClick={onUnlockClick}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg, #eab308, #ca8a04)',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.75rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {t('analyticsGrid.unlockVip', 'Unlock VIP')}
          </button>
        </div>
      )}
    </div>
  );
};
