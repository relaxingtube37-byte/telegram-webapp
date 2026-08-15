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

export const getSurfaceEmoji = (surface?: string): string => {
  if (!surface) return '🟦';
  const s = surface.toLowerCase();
  if (s.includes('clay')) return '🧱';
  if (s.includes('grass')) return '🌱';
  if (s.includes('indoor')) return '🏢';
  return '🟦';
};
