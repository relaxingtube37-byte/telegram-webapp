/**
 * Resolves player avatar URL using backend lightweight WebP service.
 */
export function getPlayerImageUrl(
  imagePath?: string | null,
  playerName?: string | null,
  playerId?: number | string | null,
  apiBase: string = 'https://telegram-backend-2yck.onrender.com/api/webapp'
): string | null {
  if (imagePath && imagePath.trim()) {
    const trimmed = imagePath.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    const cleanBase = apiBase.replace(/\/+$/, '');
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    if (cleanPath.startsWith('/api/webapp')) {
      const root = cleanBase.replace(/\/api\/webapp$/, '');
      return `${root}${cleanPath}`;
    }
    return `${cleanBase}${cleanPath}`;
  }

  if (playerId && String(playerId).trim()) {
    const cleanBase = apiBase.replace(/\/+$/, '');
    return `${cleanBase}/players/${String(playerId).trim()}/image?size=80`;
  }

  if (playerName && playerName.trim()) {
    const cleanBase = apiBase.replace(/\/+$/, '');
    return `${cleanBase}/players/${encodeURIComponent(playerName.trim())}/image?size=80`;
  }

  return null;
}
