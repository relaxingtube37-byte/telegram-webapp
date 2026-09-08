import React, { useEffect, useState } from 'react';
import { BarChart3, Lock, Activity } from 'lucide-react';
import type { DeepAnalyticsTeaser } from '../types';

interface DeepAnalyticsPanelProps {
  apiBase: string;
  fixtureId?: number;
  homeName: string;
  awayName: string;
  surface?: string;
  matchDate?: string;
  sessionToken?: string | null;
  initData?: string;
  canSeeStats: boolean;
  onUnlockClick?: () => void;
}

function authHeaders(sessionToken?: string | null, initData?: string): HeadersInit {
  const h: Record<string, string> = {};
  if (sessionToken) {
    h.Authorization = `Bearer ${sessionToken}`;
  }
  if (initData) h['x-telegram-init-data'] = initData;
  return h;
}

export const DeepAnalyticsPanel: React.FC<DeepAnalyticsPanelProps> = ({
  apiBase,
  fixtureId,
  homeName,
  awayName,
  surface,
  matchDate,
  sessionToken,
  initData,
  canSeeStats,
  onUnlockClick,
}) => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<DeepAnalyticsTeaser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = authHeaders(sessionToken, initData);
        let url: string;
        if (fixtureId) {
          url = `${apiBase}/matches/${fixtureId}/analytics`;
        } else {
          const params = new URLSearchParams({
            p1: homeName,
            p2: awayName,
            surface: surface || 'Hard',
          });
          if (matchDate) params.set('asOfDate', String(matchDate).slice(0, 10));
          url = `${apiBase}/matches/deep-analytics?${params.toString()}`;
        }
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setReport(json.data || null);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [apiBase, fixtureId, homeName, awayName, surface, matchDate, sessionToken, initData]);

  if (loading) {
    return (
      <div className="glass" style={{ padding: '1rem', borderRadius: 12, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        Loading match statistics…
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass" style={{ padding: '1rem', borderRadius: 12, color: '#fca5a5', fontSize: '0.85rem' }}>
        Stats unavailable: {error}
      </div>
    );
  }

  if (!report) return null;

  const locked = !canSeeStats || (report as any).locked === true;
  const form1 = locked ? report.teaser?.p1RollingForm : report.p1RollingForm;
  const form2 = locked ? report.teaser?.p2RollingForm : report.p2RollingForm;
  const h2h = locked ? report.teaser?.h2hSummary : report.h2hSummary;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        <BarChart3 size={16} /> Match Data & Form
      </div>

      <div className="glass" style={{ padding: '1rem', borderRadius: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
        {[form1, form2].filter(Boolean).map((f: any, idx: number) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>{f.playerName}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Last 5: <strong style={{ color: 'white' }}>{f.last5WinRatePct}%</strong>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Streak: <strong style={{ color: 'white' }}>{f.currentStreak}</strong>
            </div>
            {!locked && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Last 10: <strong style={{ color: 'white' }}>{f.last10WinRatePct}%</strong>
              </div>
            )}
          </div>
        ))}
      </div>

      {h2h && (
        <div className="glass" style={{ padding: '0.9rem 1rem', borderRadius: 12, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <Activity size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
          H2H: <strong style={{ color: 'white' }}>{h2h.p1Wins}-{h2h.p2Wins}</strong>
          {' '}({h2h.totalPreMatchEncounters} meetings)
        </div>
      )}

      {locked ? (
        <div
          className="glass"
          style={{
            padding: '1.2rem',
            borderRadius: 12,
            textAlign: 'center',
            border: '1px solid rgba(251, 191, 36, 0.3)',
          }}
        >
          <Lock size={20} color="#fbbf24" style={{ marginBottom: 8 }} />
          <div style={{ fontWeight: 800, color: 'white', marginBottom: 6 }}>Deep stats locked</div>
          <p style={{ margin: '0 0 0.8rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Surface mastery, fatigue, clutch metrics and full H2H unlock after registration.
          </p>
          {onUnlockClick && (
            <button type="button" className="btn-primary" onClick={onUnlockClick} style={{ padding: '0.55rem 1.2rem', fontWeight: 800 }}>
              Unlock full analysis
            </button>
          )}
        </div>
      ) : (
        <>
          {report.p1SurfaceMastery && report.p2SurfaceMastery && (
            <div className="glass" style={{ padding: '1rem', borderRadius: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
              {[report.p1SurfaceMastery, report.p2SurfaceMastery].map((s: any, i: number) => (
                <div key={i}>
                  <div style={{ fontWeight: 800, color: 'white', marginBottom: 4 }}>
                    {i === 0 ? homeName : awayName} on {s.surface}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>Win {s.winRatePct}% · Hold {s.holdRatePct}% · Break {s.breakRatePct}%</div>
                </div>
              ))}
            </div>
          )}
          {report.explanationCards && report.explanationCards.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {report.explanationCards.slice(0, 4).map((card, i) => (
                <div key={i} className="glass" style={{ padding: '0.75rem 0.9rem', borderRadius: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.78rem', color: 'var(--accent-amber)', marginBottom: 4 }}>{card.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{card.body}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
