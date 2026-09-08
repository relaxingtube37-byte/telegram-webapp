import type { ReferralSite } from '../types';

const PRODUCTION_ORIGIN = 'https://telegram-backend-2yck.onrender.com';

export interface BusinessActionsPublic {
  registration_referral_enabled?: boolean;
  watch_live_enabled?: boolean;
  payment_mode_placeholder_enabled?: boolean;
  shared_watch_live_url?: string;
}

/**
 * Derives public backend origin from VITE_API_BASE /api/webapp URL.
 */
export function resolveBackendOrigin(apiBase: string): string {
  const trimmed = (apiBase || '').replace(/\/+$/, '');
  if (!trimmed) return PRODUCTION_ORIGIN;
  const withoutWebapp = trimmed
    .replace(/\/api\/webapp$/i, '')
    .replace(/\/webapp$/i, '')
    .replace(/\/api$/i, '');
  return withoutWebapp || PRODUCTION_ORIGIN;
}

export function buildGoReferralUrl(
  apiBaseOrOrigin: string,
  siteId: number,
  trackingId: string | number,
  opts?: {
    action?: 'registration' | 'watch_live';
    matchId?: number;
    fixtureId?: number;
    page?: string;
    session?: string;
  }
): string {
  const tid = String(trackingId);
  if (!tid || tid === 'anonymous') return '';
  const origin = resolveBackendOrigin(apiBaseOrOrigin);
  const params = new URLSearchParams();
  if (opts?.action) params.set('action', opts.action);
  if (opts?.matchId != null) params.set('match_id', String(opts.matchId));
  if (opts?.fixtureId != null) params.set('fixture_id', String(opts.fixtureId));
  if (opts?.page) params.set('page', opts.page);
  if (opts?.session) params.set('session', opts.session);
  const qs = params.toString();
  const base = `${origin.replace(/\/+$/, '')}/go/${siteId}/${encodeURIComponent(tid)}`;
  return qs ? `${base}?${qs}` : base;
}

export function buildPartnerWatchUrl(opts: {
  apiBase: string;
  sites: ReferralSite[];
  trackingId: string | number;
  matchId?: number;
  fixtureId?: number;
}): string {
  const primary = opts.sites[0];
  if (!primary) return '';
  return buildGoReferralUrl(opts.apiBase, primary.id, opts.trackingId, {
    action: 'watch_live',
    matchId: opts.matchId,
    fixtureId: opts.fixtureId,
    page: 'watch',
  });
}

export function buildPartnerRegisterUrl(opts: {
  apiBase: string;
  sites: ReferralSite[];
  trackingId: string | number;
  page?: string;
}): string {
  const primary = opts.sites[0];
  if (!primary) return '';
  return buildGoReferralUrl(opts.apiBase, primary.id, opts.trackingId, {
    action: 'registration',
    page: opts.page || 'register',
  });
}

export function openExternalLink(url: string): void {
  if (!url) return;
  if (window.Telegram?.WebApp?.openLink) {
    window.Telegram.WebApp.openLink(url);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/** Show Watch Live when match is LIVE or starts within minutesBefore minutes. */
export function shouldShowWatchLive(
  status: string | undefined,
  matchDate: string | undefined,
  minutesBefore = 15
): boolean {
  if (status === 'LIVE') return true;
  if (status === 'WON' || status === 'LOST' || status === 'VOID' || status === 'INTERRUPTED') {
    return false;
  }
  if (status === 'UPCOMING' || !status) {
    if (!matchDate) return false;
    const start = new Date(matchDate).getTime();
    if (Number.isNaN(start)) return false;
    const diffMin = (start - Date.now()) / 60000;
    return diffMin <= minutesBefore && diffMin >= -180;
  }
  return false;
}
