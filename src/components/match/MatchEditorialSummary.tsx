import React, { useEffect, useState } from 'react';

export interface MatchEditorialView {
  fixture_id?: number;
  slug?: string;
  headline?: string;
  title?: string;
  subtitle?: string;
  summary?: string;
  short_summary?: string;
  guest_safe_summary?: string;
  key_facts?: string[];
  data_bullets?: string[];
  tags?: string[];
  share_text?: string;
  seo_title?: string;
  seo_description?: string;
  content_locked?: boolean;
  publish_status?: string;
}

interface MatchEditorialSummaryProps {
  apiBase: string;
  fixtureId?: number;
  slugHint?: string;
  sessionToken?: string | null;
}

function buildAuthHeaders(sessionToken?: string | null): HeadersInit {
  const headers: Record<string, string> = {};
  if (sessionToken) {
    headers.Authorization = `Bearer ${sessionToken}`;
    headers['x-ptin-session'] = sessionToken;
  }
  return headers;
}

/** Additive Phase D block — does not replace Phase B analytics layout. */
export const MatchEditorialSummary: React.FC<MatchEditorialSummaryProps> = ({
  apiBase,
  fixtureId,
  slugHint,
  sessionToken,
}) => {
  const [editorial, setEditorial] = useState<MatchEditorialView | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'empty' | 'error'>('idle');

  useEffect(() => {
    let cancelled = false;
    const key = fixtureId || slugHint;
    if (!key) {
      setState('empty');
      return;
    }
    setState('loading');
    const base = apiBase.replace(/\/+$/, '');
    fetch(`${base}/matches/${encodeURIComponent(String(key))}/editorial`, {
      headers: buildAuthHeaders(sessionToken),
    })
      .then(async (r) => {
        if (r.status === 404) return null;
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setEditorial(null);
          setState('empty');
          return;
        }
        setEditorial(data);
        setState('ready');
        if (data.seo_title) {
          document.title = data.seo_title;
        }
        if (data.seo_description) {
          let meta = document.querySelector('meta[name="description"]');
          if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'description');
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', data.seo_description);
        }
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase, fixtureId, slugHint, sessionToken]);

  if (state === 'loading') {
    return (
      <section className="glass" style={{ padding: '1rem', borderRadius: 14, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        Loading editorial preview…
      </section>
    );
  }
  if (state !== 'ready' || !editorial) return null;

  const title = editorial.headline || editorial.title;
  const summary = editorial.guest_safe_summary || editorial.short_summary || editorial.summary;
  const facts = Array.isArray(editorial.key_facts) ? editorial.key_facts.slice(0, 4) : [];

  return (
    <section className="glass" style={{ padding: '1rem 1.1rem', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <div style={{ fontSize: '0.72rem', letterSpacing: '0.06em', color: 'var(--text-secondary)', fontWeight: 700 }}>
        EDITORIAL PREVIEW
      </div>
      {title && <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{title}</h2>}
      {editorial.subtitle && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{editorial.subtitle}</div>
      )}
      {summary && <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.55 }}>{summary}</p>}
      {facts.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          {facts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      )}
      {editorial.content_locked && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          Guest-safe editorial teaser · full dossier unlocks for members
        </div>
      )}
    </section>
  );
};
