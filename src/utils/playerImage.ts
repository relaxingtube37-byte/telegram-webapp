import { lookupPlayerId } from '../data/playerDirectory';

const DEFAULT_API_BASE = 'https://telegram-backend-2yck.onrender.com/api/webapp';

/**
 * Resolves player avatar URL using backend lightweight WebP service.
 * Automatically resolves top ATP & WTA player IDs to guarantee instant 200 OK WebP headshots.
 */
export function getPlayerImageUrl(
  imagePath?: string | null,
  playerName?: string | null,
  playerId?: number | string | null,
  apiBase: string = DEFAULT_API_BASE
): string | null {
  let effectiveBase = (apiBase && apiBase.trim()) ? apiBase.trim() : DEFAULT_API_BASE;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && effectiveBase.includes('localhost')) {
    effectiveBase = DEFAULT_API_BASE;
  }
  const cleanBase = effectiveBase.replace(/\/+$/, '');
  const root = cleanBase.replace(/\/api\/webapp$/, '');

  // 1. If explicit numeric playerId is provided, build instant endpoint
  if (playerId && !isNaN(Number(playerId))) {
    return `${cleanBase}/players/${Number(playerId)}/image?size=80`;
  }

  // 2. Try looking up numeric ID from playerName (e.g. "Q. Zheng" -> 257784, "E. Rybakina" -> 186312)
  const resolvedFromPlayerName = lookupPlayerId(playerName);
  if (resolvedFromPlayerName) {
    return `${cleanBase}/players/${resolvedFromPlayerName}/image?size=80`;
  }

  // 3. If imagePath is provided, check if it contains a player name/id or external URL
  if (imagePath && imagePath.trim()) {
    const trimmed = imagePath.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    // If imagePath is "/api/webapp/players/:nameOrId/image...", resolve param to numeric ID
    const match = trimmed.match(/\/players\/([^/?#]+)\/image/);
    if (match && match[1]) {
      const extractedParam = decodeURIComponent(match[1]);
      const resolvedFromParam = lookupPlayerId(extractedParam);
      if (resolvedFromParam) {
        return `${cleanBase}/players/${resolvedFromParam}/image?size=80`;
      }
    }

    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    if (cleanPath.startsWith('/api/webapp')) {
      return `${root}${cleanPath}`;
    }
    return `${cleanBase}${cleanPath}`;
  }

  // 4. Fallback with playerName encoded if not found in directory
  if (playerName && playerName.trim()) {
    return `${cleanBase}/players/${encodeURIComponent(playerName.trim())}/image?size=80`;
  }

  return null;
}
