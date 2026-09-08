import type { Prediction } from '../types';

/** Derive `/api/web` origin from existing `/api/webapp` base without changing Phase A. */
export function resolveWebApiBase(webappApiBase: string): string {
  const trimmed = (webappApiBase || '').replace(/\/+$/, '');
  if (!trimmed) return 'http://localhost:8080/api/web';
  if (trimmed.endsWith('/api/web')) return trimmed;
  if (trimmed.endsWith('/api/webapp')) return trimmed.replace(/\/api\/webapp$/i, '/api/web');
  if (trimmed.endsWith('/webapp')) return trimmed.replace(/\/webapp$/i, '/web');
  if (trimmed.endsWith('/api')) return `${trimmed}/web`;
  return `${trimmed}/api/web`;
}

export function buildAuthHeaders(sessionToken: string | null | undefined): HeadersInit {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (sessionToken) {
    headers.Authorization = `Bearer ${sessionToken}`;
    headers['x-ptin-session'] = sessionToken;
  }
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
    headers['x-telegram-init-data'] = window.Telegram.WebApp.initData;
  }
  return headers;
}

export interface WebMatchesResponse {
  status?: string;
  verified?: boolean;
  access_mode?: string;
  layers?: {
    guest_can_see_summary?: boolean;
    guest_stats_level?: 'none' | 'partial' | 'full';
    guest_can_see_ai_full?: boolean;
  };
  matches?: Prediction[];
}

export interface WebDeepAnalyticsResponse {
  status?: string;
  verified?: boolean;
  access_mode?: string;
  guest_stats_level?: string;
  content_locked?: boolean;
  data?: Record<string, unknown> | null;
  error?: string;
}

export async function fetchWebMatches(
  webApiBase: string,
  sessionToken: string | null | undefined,
  limit = 100
): Promise<WebMatchesResponse> {
  const res = await fetch(`${webApiBase}/matches?limit=${limit}`, {
    headers: buildAuthHeaders(sessionToken),
  });
  if (!res.ok) throw new Error(`Matches HTTP ${res.status}`);
  return res.json();
}

export async function fetchDeepAnalytics(
  webApiBase: string,
  sessionToken: string | null | undefined,
  params: { p1: string; p2: string; surface?: string; asOfDate?: string }
): Promise<WebDeepAnalyticsResponse> {
  const q = new URLSearchParams({
    p1: params.p1,
    p2: params.p2,
    surface: params.surface || 'Hard',
  });
  if (params.asOfDate) q.set('asOfDate', params.asOfDate.slice(0, 10));
  const res = await fetch(`${webApiBase}/matches/deep-analytics?${q.toString()}`, {
    headers: buildAuthHeaders(sessionToken),
  });
  if (!res.ok) throw new Error(`Deep analytics HTTP ${res.status}`);
  return res.json();
}

export function findMatchInWebList(
  matches: Prediction[] | undefined,
  seed: Prediction
): Prediction | undefined {
  if (!matches?.length) return undefined;
  const fid = seed.fixture_id;
  if (fid != null) {
    const byFixture = matches.find((m) => m.fixture_id === fid);
    if (byFixture) return byFixture;
  }
  return matches.find((m) => m.id === seed.id);
}
