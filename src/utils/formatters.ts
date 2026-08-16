export const TIMEZONE_KEY = 'tg_webapp_timezone';

export const getInitialTimezone = (): string => {
  try {
    return localStorage.getItem(TIMEZONE_KEY) || 'UTC';
  } catch {
    return 'UTC';
  }
};

export const formatMatchTime = (dateStr?: string, timeZone: string = 'UTC'): string => {
  if (!dateStr) return '--:--';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.split('T')[1]?.slice(0, 5) || '--:--';

    if (timeZone === 'local') {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    return d.toLocaleTimeString('en-US', {
      timeZone: timeZone || 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '--:--';
  }
};

export const formatMatchDate = (dateStr?: string, timeZone: string = 'UTC'): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.split('T')[0] || '';

    const tz = timeZone === 'local' ? undefined : (timeZone || 'UTC');
    return d.toLocaleDateString('en-US', {
      timeZone: tz,
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr ? dateStr.split('T')[0] : '';
  }
};

export const getCompactDateLabel = (dateStr?: string, timeZone: string = 'UTC'): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';

    const tz = timeZone === 'local' ? undefined : (timeZone || 'UTC');
    
    // Format date string for match and today in selected timezone
    const now = new Date();
    const matchDateStr = d.toLocaleDateString('en-CA', { timeZone: tz }); // YYYY-MM-DD
    const todayDateStr = now.toLocaleDateString('en-CA', { timeZone: tz });

    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowDateStr = tomorrow.toLocaleDateString('en-CA', { timeZone: tz });

    if (matchDateStr === todayDateStr) {
      return 'Today';
    }
    if (matchDateStr === tomorrowDateStr) {
      return 'Tomorrow';
    }

    return d.toLocaleDateString('en-US', {
      timeZone: tz,
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
};

export const matchMatchesDateFilter = (
  dateStr?: string,
  filter: 'all' | 'today' | 'tomorrow' | 'week' = 'all',
  timeZone: string = 'UTC'
): boolean => {
  if (filter === 'all' || !dateStr) return true;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return true;

    const tz = timeZone === 'local' ? undefined : (timeZone || 'UTC');
    const now = new Date();
    
    const matchDateStr = d.toLocaleDateString('en-CA', { timeZone: tz });
    const todayDateStr = now.toLocaleDateString('en-CA', { timeZone: tz });

    if (filter === 'today') {
      return matchDateStr === todayDateStr;
    }

    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowDateStr = tomorrow.toLocaleDateString('en-CA', { timeZone: tz });

    if (filter === 'tomorrow') {
      return matchDateStr === tomorrowDateStr;
    }

    if (filter === 'week') {
      const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return d >= now && d <= oneWeekLater;
    }

    return true;
  } catch {
    return true;
  }
};

export const getSurfaceEmoji = (surface?: string): string => {
  if (!surface) return '🟦';
  const s = surface.toLowerCase();
  if (s.includes('clay')) return '🧱';
  if (s.includes('grass')) return '🌱';
  if (s.includes('indoor')) return '🏢';
  return '🟦';
};

export const getMatchGender = (tournamentName?: string, roundName?: string, matchTitle?: string): 'men' | 'women' | 'unknown' => {
  const combined = `${tournamentName || ''} ${roundName || ''} ${matchTitle || ''}`.toLowerCase();

  if (
    combined.includes('wta') ||
    combined.includes('women') ||
    combined.includes('w15') ||
    combined.includes('w25') ||
    combined.includes('w35') ||
    combined.includes('w50') ||
    combined.includes('w75') ||
    combined.includes('w100') ||
    combined.includes('billie jean king')
  ) {
    return 'women';
  }

  if (
    combined.includes('atp') ||
    combined.includes('men') ||
    combined.includes('m15') ||
    combined.includes('m25') ||
    combined.includes('challenger') ||
    combined.includes('davis cup')
  ) {
    return 'men';
  }

  return 'men'; // Default to men/general if not explicitly WTA
};

export const formatPlayerDisplayName = (name?: string): string => {
  if (!name) return '';
  const trimmed = name.trim();
  if (!trimmed.includes(' ')) return trimmed;

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];

  // If format is like "Alcaraz C.", convert to "C. Alcaraz"
  if (parts[parts.length - 1].length <= 2 && parts[parts.length - 1].endsWith('.')) {
    const initial = parts.pop();
    return `${initial} ${parts.join(' ')}`;
  }

  // Standard: "Carlos Alcaraz" -> "C. Alcaraz", "Juan Manuel Cerundolo" -> "J. M. Cerundolo"
  const lastName = parts[parts.length - 1];
  const firstInitials = parts.slice(0, -1).map(p => `${p[0].toUpperCase()}.`).join(' ');
  return `${firstInitials} ${lastName}`;
};

export const formatOptionPillText = (
  selection?: string,
  market?: string,
  homeName?: string,
  awayName?: string
): string => {
  if (!selection) return market || 'Best Pick';
  const sel = selection.trim();

  // 1. Total Sets (e.g. "Over 2.5 Sets", "Under 2.5 Sets")
  if (/Over\s+2\.5\s*Sets?/i.test(sel)) return 'Over 2.5 Sets';
  if (/Under\s+2\.5\s*Sets?/i.test(sel)) return 'Under 2.5 Sets';

  // 2. Set Handicap (e.g. "Alcaraz +1.5 Sets", "+1.5 Sets", "-1.5 Sets")
  const handicapMatch = sel.match(/([+-]\d+\.?\d*)\s*Sets?/i);
  if (handicapMatch) return `${handicapMatch[1]} Sets`;

  // 3. Total Games (e.g. "Over 22.5 Games", "Over 21.5", "Under 20.5 Games")
  const overGamesMatch = sel.match(/Over\s+(\d+\.?\d*)/i);
  if (overGamesMatch) return `Over ${overGamesMatch[1]} Games`;

  const underGamesMatch = sel.match(/Under\s+(\d+\.?\d*)/i);
  if (underGamesMatch) return `Under ${underGamesMatch[1]} Games`;

  // 4. Correct Score (e.g. "2:0", "2:1", "0:2", "1:2")
  if (/^\d+:\d+$/.test(sel)) return `Score ${sel}`;

  // 5. If selection is the player's name (Match Winner / Moneyline)
  if (
    (homeName && sel.toLowerCase().includes(homeName.toLowerCase())) ||
    (awayName && sel.toLowerCase().includes(awayName.toLowerCase())) ||
    (market && market.toLowerCase().includes('winner')) ||
    (market && market.toLowerCase().includes('moneyline'))
  ) {
    return 'Match Winner';
  }

  // Fallback: If player name is prefixed to something like "Player +1.5", strip player name
  let cleaned = sel;
  if (homeName) cleaned = cleaned.replace(new RegExp(homeName, 'gi'), '').trim();
  if (awayName) cleaned = cleaned.replace(new RegExp(awayName, 'gi'), '').trim();
  if (cleaned.length > 2) return cleaned;

  return market || sel;
};
