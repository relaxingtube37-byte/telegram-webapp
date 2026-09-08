import React from 'react';
import { Activity, BarChart3, Lock } from 'lucide-react';
import type { MappedDeepAnalytics } from '../../match/mapDeepAnalytics';

interface MatchAnalyticsGridProps {
  analytics: MappedDeepAnalytics | null;
  loading?: boolean;
  error?: string | null;
  homeName: string;
  awayName: string;
  onUnlockClick?: () => void;
}

function StatCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass" style={{ padding: '0.9rem 1rem', borderRadius: 12, minWidth: 0 }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export const MatchAnalyticsGrid: React.FC<MatchAnalyticsGridProps> = ({
  analytics,
  loading,
  error,
  homeName,
  awayName,
  onUnlockClick,
}) => {
  if (loading) {
    return (
      <div className="glass" style={{ padding: '1.1rem', borderRadius: 12, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        Loading match data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass" style={{ padding: '1.1rem', borderRadius: 12, color: '#fca5a5', fontSize: '0.85rem' }}>
        Match data unavailable right now. {error}
      </div>
    );
  }

  if (!analytics) return null;

  const { p1Form, p2Form, h2h, p1Surface, p2Surface, p1Workload, p2Workload, locked, previewOnly } = analytics;
  const hasAny = !!(p1Form || p2Form || h2h || p1Surface || p2Surface || p1Workload || p2Workload);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        <BarChart3 size={15} /> Match data
        {previewOnly && <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700 }}>· limited preview</span>}
      </div>

      {!hasAny && locked ? (
        <div
          className="glass"
          style={{
            padding: '1.25rem',
            borderRadius: 12,
            textAlign: 'center',
            border: '1px solid rgba(251, 191, 36, 0.28)',
          }}
        >
          <Lock size={20} color="#fbbf24" style={{ marginBottom: 8 }} />
          <div style={{ fontWeight: 800, color: 'white', marginBottom: 6 }}>Deep stats available for members</div>
          <p style={{ margin: '0 0 0.85rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Recent form, surface mastery, H2H detail, and fatigue indicators unlock after registration.
          </p>
          {onUnlockClick && (
            <button type="button" className="btn-primary" onClick={onUnlockClick} style={{ padding: '0.55rem 1.15rem', fontWeight: 800 }}>
              Unlock full match data
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.7rem' }}>
          {(p1Form || p2Form) && (
            <StatCard title="Recent form">
              {[p1Form, p2Form].filter(Boolean).map((f, i) => (
                <div key={i} style={{ marginBottom: i === 0 ? 10 : 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <div style={{ fontWeight: 800, color: 'white', marginBottom: 2 }}>{f!.playerName}</div>
                  <div>Last 5: <strong style={{ color: 'white' }}>{f!.last5WinRatePct != null ? `${f!.last5WinRatePct}%` : '—'}</strong></div>
                  {f!.last10WinRatePct != null && (
                    <div>Last 10: <strong style={{ color: 'white' }}>{f!.last10WinRatePct}%</strong></div>
                  )}
                  {f!.currentStreak && <div>Streak: <strong style={{ color: 'white' }}>{f!.currentStreak}</strong></div>}
                </div>
              ))}
            </StatCard>
          )}

          {h2h && (
            <StatCard title="Head-to-head">
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={14} />
                <span>
                  <strong style={{ color: 'white' }}>{h2h.p1Wins}-{h2h.p2Wins}</strong> ({h2h.total} meetings)
                </span>
              </div>
              <div style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {homeName} vs {awayName}
              </div>
            </StatCard>
          )}

          {(p1Surface || p2Surface) && (
            <StatCard title="Surface form">
              {[{ label: homeName, s: p1Surface }, { label: awayName, s: p2Surface }].map((row, i) =>
                row.s ? (
                  <div key={i} style={{ marginBottom: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ fontWeight: 800, color: 'white' }}>{row.label}</div>
                    <div>
                      Win {row.s.winRatePct != null ? `${row.s.winRatePct}%` : '—'} · Hold {row.s.holdRatePct != null ? `${row.s.holdRatePct}%` : '—'} · Break {row.s.breakRatePct != null ? `${row.s.breakRatePct}%` : '—'}
                    </div>
                  </div>
                ) : null
              )}
            </StatCard>
          )}

          {(p1Workload || p2Workload) && (
            <StatCard title="Workload / fatigue">
              {[{ label: homeName, w: p1Workload }, { label: awayName, w: p2Workload }].map((row, i) =>
                row.w ? (
                  <div key={i} style={{ marginBottom: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ fontWeight: 800, color: 'white' }}>{row.label}</div>
                    <div>{row.w.fatigueStatusLabel || '—'}</div>
                    <div>
                      Energy {row.w.energyTankPct != null ? `${row.w.energyTankPct}%` : '—'}
                      {row.w.daysSinceLastMatch != null ? ` · Rest ${row.w.daysSinceLastMatch}d` : ''}
                    </div>
                  </div>
                ) : null
              )}
            </StatCard>
          )}
        </div>
      )}

      {locked && hasAny && (
        <div style={{ fontSize: '0.78rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lock size={13} />
          Full surface, fatigue, and clutch detail unlocks for members.
          {onUnlockClick && (
            <button type="button" onClick={onUnlockClick} style={{ marginLeft: 4, background: 'transparent', border: 'none', color: '#93c5fd', cursor: 'pointer', fontWeight: 700 }}>
              Unlock
            </button>
          )}
        </div>
      )}
    </div>
  );
};
