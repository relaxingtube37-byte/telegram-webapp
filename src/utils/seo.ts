import type { Prediction } from '../types';

/**
 * Builds an SEO-friendly URL slug for a match prediction.
 * Example: "carlos-alcaraz-vs-jannik-sinner-123456"
 */
export function buildMatchSlug(pred: Prediction): string {
  const home = (pred.home_name || 'player1')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const away = (pred.away_name || 'player2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const idPart = pred.fixture_id || pred.id;
  return `${home}-vs-${away}-${idPart}`;
}

/**
 * Parses match identifier (slug or ID) from current window location.
 * Supports both path-based (/match/:slug) and query-based (?match=idOrSlug).
 */
export function parseMatchParamFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Path-based routing: /match/:slug or /match/:id
    const pathname = window.location.pathname;
    const pathMatch = pathname.match(/^\/match\/([^/?#]+)/i);
    if (pathMatch && pathMatch[1]) {
      return decodeURIComponent(pathMatch[1]);
    }

    // 2. Query-based routing: ?match=idOrSlug
    const searchParams = new URLSearchParams(window.location.search);
    const queryMatch = searchParams.get('match');
    if (queryMatch) {
      return queryMatch.trim();
    }
  } catch {}

  return null;
}

/**
 * Finds a matching prediction from a list by fixture ID, primary ID, or slug.
 */
export function findMatchByParam(predictions: Prediction[], param: string): Prediction | null {
  if (!param || !predictions || predictions.length === 0) return null;
  const pStr = param.trim().toLowerCase();

  // 1. Exact match by fixture_id or id
  const byId = predictions.find(
    (p) => String(p.fixture_id) === pStr || String(p.id) === pStr
  );
  if (byId) return byId;

  // 2. Trailing ID from slug (e.g., -12345)
  const trailingMatch = pStr.match(/-(\d+)$/);
  if (trailingMatch) {
    const trailingId = trailingMatch[1];
    const byTrailing = predictions.find(
      (p) => String(p.fixture_id) === trailingId || String(p.id) === trailingId
    );
    if (byTrailing) return byTrailing;
  }

  // 3. Match by player names in slug
  const byNames = predictions.find((p) => {
    const slug = `${p.home_name}-vs-${p.away_name}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    return pStr.includes(slug) || slug.includes(pStr);
  });
  if (byNames) return byNames;

  return null;
}
