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
