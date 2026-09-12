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

export const formatMatchSubLabel = (
  dateLabel?: string,
  roundName?: string
): { text: string; fullTitle: string } => {
  const cleanRound = (roundName || '').trim();
  const cleanDate = (dateLabel || '').trim();

  if (!cleanDate && !cleanRound) return { text: '', fullTitle: '' };
  if (!cleanDate) return { text: cleanRound, fullTitle: cleanRound };
  if (!cleanRound) return { text: cleanDate, fullTitle: cleanDate };

  const fullTitle = `${cleanDate} • ${cleanRound}`;

  // If match is today, round name takes priority as date is self-evident
  if (cleanDate === 'Today') {
    return { text: cleanRound, fullTitle };
  }

  // Abbreviate common tennis rounds when combined with date to prevent overflow
  let shortRound = cleanRound;
  if (/semi/i.test(cleanRound)) shortRound = 'SF';
  else if (/quarter/i.test(cleanRound)) shortRound = 'QF';
  else if (/round of 16/i.test(cleanRound) || /1\/8/i.test(cleanRound)) shortRound = 'R16';
  else if (/round of 32/i.test(cleanRound) || /1\/16/i.test(cleanRound)) shortRound = 'R32';
  else if (/round of 64/i.test(cleanRound)) shortRound = 'R64';
  else if (/round of 128/i.test(cleanRound)) shortRound = 'R128';
  else if (/qualification/i.test(cleanRound) || /qualifying/i.test(cleanRound)) shortRound = 'Q';
  else if (shortRound.length > 8) shortRound = shortRound.slice(0, 6) + '..';

  const shortDate = cleanDate === 'Tomorrow' ? 'Tmrw' : cleanDate;
  return {
    text: `${shortDate} • ${shortRound}`,
    fullTitle,
  };
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

const WTA_KEYWORDS = [
  'wta', 'women', 'w15', 'w25', 'w35', 'w50', 'w75', 'w100', 'billie jean king', 'bjk cup', 'ladies', 'girls',
  'sabalenka', 'rybakina', 'pegula', 'gauff', 'swiatek', 'andreeva', 'muchova', 'noskova', 'svitolina',
  'anisimova', 'kostyuk', 'bencic', 'osaka', 'shnaider', 'paolini', 'jovic', 'mboko', 'alexandrova',
  'cirstea', 'eala', 'kalinskaya', 'mertens', 'chwalinska', 'keys', 'potapova', 'krejcikova', 'bouzkova',
  'navarro', 'ostapenko', 'fernandez', 'sakkari', 'baptiste', 'vekic', 'bejlek', 'wang', 'tjen', 'bucsa',
  'bartunkova', 'cristian', 'frech', 'tauson', 'samsonova', 'siniakova', 'snigur', 'oliynykova', 'korpatsch',
  'tagger', 'sherif', 'sonmez', 'kalinina', 'golubic', 'stearns', 'zhang', 'osorio', 'krueger', 'pliskova',
  'kessler', 'raducanu', 'cocciaretto', 'ruzic', 'linette', 'parks', 'valentova', 'gibson', 'parry',
  'joint', 'kasatkina', 'birrell', 'mcnally', 'boulter', 'marcinko', 'zarazua', 'ruse', 'korneeva',
  'bondar', 'udvardy', 'starodubtseva', 'tararudee', 'maria', 'putintseva', 'vandewinkel', 'rakhimova',
  'badosa', 'kraus', 'sierra', 'waltert', 'vidmanova', 'volynets', 'maneiro', 'zakharova', 'lys',
  'tomljanovic', 'townsend', 'arango', 'timofeeva', 'kudermetova', 'siegemund', 'selekhmeteva',
  'uchijima', 'preston', 'jacquemot', 'seidel', 'jones', 'sawangkaew', 'gracheva', 'yastremska',
  'erjavec', 'quevedo', 'blinkova', 'semenistaja', 'charaeva', 'liu', 'kenin', 'bronzetti', 'jeanjean',
  'grabher', 'sun', 'kalieva', 'day', 'samson', 'salkova', 'kartal', 'kasintseva', 'yuan', 'zheng',
  'sramkova', 'liutova', 'stoiana', 'inglis', 'kawa', 'ribera', 'pigato', 'sakatsume', 'podrez',
  'sasnovich', 'vandromme', 'akugue', 'stefanini', 'dart', 'stakusic', 'ferro', 'garcia', 'vondrousova',
  'gormaz', 'kostovic', 'barty', 'halep', 'serena', 'venus', 'wozniacki', 'kerber', 'kvitova',
  'andreescu', 'sharapova', 'hingis', 'clijsters', 'henin', 'davenport'
];

export const getMatchGender = (
  tournamentName?: string,
  roundName?: string,
  matchTitle?: string,
  homeName?: string,
  awayName?: string
): 'men' | 'women' => {
  const normalize = (str?: string) =>
    (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const tourn = normalize(tournamentName);
  const round = normalize(roundName);
  const title = normalize(matchTitle);
  const home = normalize(homeName);
  const away = normalize(awayName);

  const combined = `${tourn} ${round} ${title} ${home} ${away}`;

  // 1. Explicit Tournament / Round / Title indicators
  if (
    combined.includes('wta') ||
    combined.includes('women') ||
    combined.includes('ladies') ||
    combined.includes('billie jean king') ||
    combined.includes('bjk cup') ||
    combined.includes('girls') ||
    /\bw(15|25|35|50|75|100)\b/.test(combined)
  ) {
    return 'women';
  }

  // 2. Player name checks against WTA roster
  if (WTA_KEYWORDS.some(k => combined.includes(k))) {
    return 'women';
  }

  // 3. Men checks
  if (
    combined.includes('atp') ||
    combined.includes('men') ||
    combined.includes('challenger') ||
    combined.includes('davis cup') ||
    /\bm(15|25)\b/.test(combined)
  ) {
    return 'men';
  }

  return 'men'; // Default to men if no indicator found
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

export const getTournamentPriority = (tournamentName?: string): number => {
  const combined = (tournamentName || '').toLowerCase();

  // Tier 1: Grand Slams & Tour Finals (Priority 1)
  if (
    combined.includes('australian open') ||
    combined.includes('roland garros') ||
    combined.includes('french open') ||
    combined.includes('wimbledon') ||
    combined.includes('us open') ||
    combined.includes('atp finals') ||
    combined.includes('wta finals') ||
    combined.includes('grand slam') ||
    combined.includes('olympic')
  ) {
    return 1;
  }

  // Tier 2: Masters 1000 & WTA 1000 (Priority 2)
  if (
    /\b1000\b/.test(combined) ||
    combined.includes('indian wells') ||
    combined.includes('miami open') ||
    combined.includes('monte carlo') ||
    combined.includes('monte-carlo') ||
    combined.includes('madrid open') ||
    combined.includes('italian open') ||
    combined.includes('cincinnati') ||
    combined.includes('shanghai masters') ||
    combined.includes('paris masters') ||
    combined.includes('wuhan open') ||
    combined.includes('canadian open') ||
    combined.includes('national bank open')
  ) {
    return 2;
  }

  // Tier 3: ATP 500 & WTA 500 (Priority 3)
  if (
    /\b500\b/.test(combined) ||
    combined.includes('barcelona open') ||
    /\bhalle\b/.test(combined) ||
    combined.includes("queen's club") ||
    combined.includes('rotterdam') ||
    combined.includes('rio open') ||
    combined.includes('acapulco') ||
    combined.includes('beijing open') ||
    combined.includes('japan open') ||
    combined.includes('vienna open') ||
    combined.includes('swiss indoors')
  ) {
    return 3;
  }

  // Tier 5: Challenger & WTA 125 (Priority 5) - Checked before general ATP/WTA text
  if (
    combined.includes('challenger') ||
    /\b125(?:k)?\b/.test(combined) ||
    combined.includes('wta 125')
  ) {
    return 5;
  }

  // Tier 6: ITF World Tennis Tour & Futures (Priority 6)
  if (
    /\bitf\b/.test(combined) ||
    /\bm15\b/.test(combined) ||
    /\bm25\b/.test(combined) ||
    /\bw15\b/.test(combined) ||
    /\bw25\b/.test(combined) ||
    /\bw35\b/.test(combined) ||
    /\bw50\b/.test(combined) ||
    /\bw75\b/.test(combined) ||
    /\bw100\b/.test(combined)
  ) {
    return 6;
  }

  // Tier 4: ATP 250 & WTA 250 / Main Tour (Priority 4)
  if (
    /\b250\b/.test(combined) ||
    /\batp\b/.test(combined) ||
    /\bwta\b/.test(combined) ||
    combined.includes('doha') ||
    combined.includes('dubai')
  ) {
    return 4;
  }

  // Tier 7: Others / Exhibition / UTR
  return 7;
};

export interface AgentDossierSection {
  type: 'overview' | 'statistical' | 'physical' | 'historical' | 'verdict' | 'tactical' | 'risk' | 'general';
  icon: string;
  title: string;
  color: string;
  bg: string;
  border: string;
  body: string;
}

export function parseAiDossierSections(text?: string): AgentDossierSection[] {
  if (!text || typeof text !== 'string') return [];

  // Normalize delimiters if newlines were stripped or joined with emoji headers
  const normalized = text
    .replace(/\s*([📊📈]?\s*Statistical & Surface Dynamics:?)/gi, '\n\n$1')
    .replace(/\s*([🏃‍♂️🏃‍♀️🏃]?\s*Physical Conditioning & Fatigue Analysis:?)/gi, '\n\n$1')
    .replace(/\s*([📜🏛️]?\s*Historical Matchup & Mental Fortitude:?)/gi, '\n\n$1')
    .replace(/\s*([🎯🏆]?\s*Strategic (?:Consensus Verdict|Projection):?)/gi, '\n\n$1')
    .replace(/\s*([🧠💡]?\s*Tactical (?:Match Dossier|Dossier):?)/gi, '\n\n$1')
    .replace(/\s*(⚠️\s*(?:Critical Upset Scenario|Critical upset scenario to monitor|Devils Advocate):?)/gi, '\n\n$1');

  const rawBlocks = normalized
    .split(/\n\s*\n|\r\n\s*\r\n/)
    .map(b => b.trim())
    .filter(Boolean);

  const sections: AgentDossierSection[] = [];

  for (let bIdx = 0; bIdx < rawBlocks.length; bIdx++) {
    const block = rawBlocks[bIdx];
    let type: AgentDossierSection['type'] = bIdx === 0 ? 'overview' : 'general';
    let icon = bIdx === 0 ? '🌐' : '📝';
    let title = bIdx === 0 ? 'Executive Match Overview' : 'Tactical Insight';
    let color = '#38bdf8';
    let bg = 'rgba(255, 255, 255, 0.02)';
    let border = 'rgba(255, 255, 255, 0.07)';
    let body = block;

    if (/^[📊📈]|\bStatistical & Surface Dynamics\b/i.test(block)) {
      type = 'statistical';
      icon = '📊';
      color = '#38bdf8';
      bg = 'rgba(56, 189, 248, 0.03)';
      border = 'rgba(56, 189, 248, 0.16)';
      const colonIdx = block.indexOf(':');
      title = colonIdx !== -1 ? block.slice(0, colonIdx).replace(/^[📊📈]\s*/, '').trim() : 'Statistical & Surface Dynamics';
      body = colonIdx !== -1 ? block.slice(colonIdx + 1).trim() : block;
    } else if (/^[🏃]|\bPhysical Conditioning\b/i.test(block)) {
      type = 'physical';
      icon = '🏃';
      color = '#34d399';
      bg = 'rgba(52, 211, 153, 0.03)';
      border = 'rgba(52, 211, 153, 0.16)';
      const colonIdx = block.indexOf(':');
      title = colonIdx !== -1 ? block.slice(0, colonIdx).replace(/^[🏃‍♂️🏃‍♀️🏃]\s*/, '').trim() : 'Physical Conditioning & Fatigue Analysis';
      body = colonIdx !== -1 ? block.slice(colonIdx + 1).trim() : block;
    } else if (/^[📜]|\bHistorical Matchup\b/i.test(block)) {
      type = 'historical';
      icon = '📜';
      color = '#a78bfa';
      bg = 'rgba(167, 139, 250, 0.03)';
      border = 'rgba(167, 139, 250, 0.16)';
      const colonIdx = block.indexOf(':');
      title = colonIdx !== -1 ? block.slice(0, colonIdx).replace(/^[📜🏛️]\s*/, '').trim() : 'Historical Matchup & Mental Fortitude';
      body = colonIdx !== -1 ? block.slice(colonIdx + 1).trim() : block;
    } else if (/^[🎯]|\bStrategic (?:Projection|Consensus)\b/i.test(block)) {
      type = 'verdict';
      icon = '🎯';
      color = '#fbbf24';
      bg = 'rgba(251, 191, 36, 0.03)';
      border = 'rgba(251, 191, 36, 0.16)';
      const colonIdx = block.indexOf(':');
      title = colonIdx !== -1 ? block.slice(0, colonIdx).replace(/^[🎯🏆]\s*/, '').trim() : 'Strategic Consensus Verdict';
      body = colonIdx !== -1 ? block.slice(colonIdx + 1).trim() : block;
    } else if (/^[🧠]|\bTactical Dossier\b/i.test(block)) {
      type = 'tactical';
      icon = '🧠';
      color = '#818cf8';
      bg = 'rgba(129, 140, 248, 0.03)';
      border = 'rgba(129, 140, 248, 0.16)';
      const colonIdx = block.indexOf(':');
      title = colonIdx !== -1 ? block.slice(0, colonIdx).replace(/^[🧠💡]\s*/, '').trim() : 'Tactical Match Dossier';
      body = colonIdx !== -1 ? block.slice(colonIdx + 1).trim() : block;
    } else if (/^⚠️|\bCritical (?:Upset|upset)\b/i.test(block)) {
      type = 'risk';
      icon = '⚠️';
      color = '#f87171';
      bg = 'rgba(239, 68, 68, 0.03)';
      border = 'rgba(239, 68, 68, 0.16)';
      const colonIdx = block.indexOf(':');
      title = colonIdx !== -1 ? block.slice(0, colonIdx).replace(/^⚠️\s*/, '').trim() : 'Critical Upset Scenario';
      body = colonIdx !== -1 ? block.slice(colonIdx + 1).trim() : block;
    }

    // Clean body text: remove leading symbols/diamonds like ◆ or •
    body = body.replace(/^[\s◆•\-_*:]+/, '').trim();

    // Discard empty or meaningless phantom blocks
    if (!body || body.length < 6 || /^[\s◆•\-_*.]+$/.test(body)) {
      continue;
    }

    // Deduplicate identical section titles: merge text if same title repeats
    const normTitle = title.toLowerCase().trim();
    const existing = sections.find(s => s.title.toLowerCase().trim() === normTitle);
    if (existing) {
      if (!existing.body.includes(body)) {
        existing.body = `${existing.body} ${body}`.trim();
      }
      continue;
    }

    sections.push({ type, icon, title, color, bg, border, body });
  }

  return sections;
}

export interface ParsedTennisScore {
  isLive: boolean;
  isFinished: boolean;
  setsScore: string; // e.g. "2-0", "2-1", "1-0"
  liveSets?: string; // e.g. "1-0"
  liveGames?: string; // e.g. "4-3" (current set games)
  livePoints?: string; // e.g. "15-30" (current game points)
  homeSets?: string;
  awaySets?: string;
  homeGames?: string;
  awayGames?: string;
  homePoints?: string;
  awayPoints?: string;
  summaryText: string; // e.g. "1-0   15-30    4-3" for LIVE, or "2-0" for finished
}

/**
 * Parses raw match score strings for both Live and Finished tennis matches.
 * - Finished matches: strictly displays sets count only (e.g. "2-0", "2-1", "0-2")
 * - Live matches: displays sets score, game points, and current set games (e.g. "1-0   15-30    4-3")
 */
export function parseTennisScore(rawScore?: string, status?: string): ParsedTennisScore | null {
  const isLive = status === 'LIVE';
  const clean = (rawScore || '').trim();

  // If no score string provided:
  // - WON/LOST with no actual score: return null (don't fabricate scores)
  // - LIVE with no real data: return null (don't fabricate dummy zeros)
  // - Other statuses: return null
  if (!clean) {
    return null;
  }

  // ── 0. SPECIAL LABELS: Walkover / Retirement ──
  // These are single-word scores like "W/O" or "RET" set by the settler
  if (/^(W\/O|WO|WALKOVER|RET|RETIREMENT)$/i.test(clean)) {
    return {
      isLive: false,
      isFinished: true,
      setsScore: clean.toUpperCase() === 'WO' ? 'W/O' : clean.toUpperCase(),
      summaryText: clean.toUpperCase() === 'WO' ? 'W/O' : clean.toUpperCase(),
    };
  }

  // ── 1. LIVE MATCHES ──

  // Expected or user format: "1-0   15-30    4-3" or "1-0 | 15-30 | 4-3"
  if (isLive || clean.includes('   ') || clean.includes('  ')) {
    const parts = clean.split(/[\s|,]+/).filter(Boolean);
    const scoreTokens = parts.filter((p) => /^([0-9A-Za-z]+)[-:]([0-9A-Za-z]+)$/.test(p));

    if (scoreTokens.length >= 2) {
      let liveSets = '';
      let liveGames = '';
      let livePoints = '';

      // Determine points token (typically contains 15, 30, 40, A, ADV, AD)
      const isPoint = (tok: string) => {
        const [a, b] = tok.split(/[-:]/);
        return /^(15|30|40|A|AD|ADV)$/i.test(a) || /^(15|30|40|A|AD|ADV)$/i.test(b);
      };

      const pointIdx = scoreTokens.findIndex(isPoint);
      if (pointIdx !== -1) {
        livePoints = scoreTokens[pointIdx].replace(':', '-');
        const remaining = scoreTokens.filter((_, i) => i !== pointIdx);
        if (remaining.length >= 2) {
          liveSets = remaining[0].replace(':', '-');
          liveGames = remaining[1].replace(':', '-');
        } else if (remaining.length === 1) {
          liveSets = remaining[0].replace(':', '-');
        }
      } else if (scoreTokens.length >= 3) {
        // User order: sets, points, games (e.g. 1-0   15-30   4-3)
        liveSets = scoreTokens[0].replace(':', '-');
        livePoints = scoreTokens[1].replace(':', '-');
        liveGames = scoreTokens[2].replace(':', '-');
      } else if (scoreTokens.length === 2) {
        liveSets = scoreTokens[0].replace(':', '-');
        liveGames = scoreTokens[1].replace(':', '-');
      }

      const [hS = '', aS = ''] = liveSets ? liveSets.split('-') : [];
      const [hG = '', aG = ''] = liveGames ? liveGames.split('-') : [];
      const [hP = '', aP = ''] = livePoints ? livePoints.split('-') : [];

      // Format as user requested: "1-0   15-30    4-3"
      const summaryParts = [liveSets, livePoints, liveGames].filter(Boolean);
      return {
        isLive: true,
        isFinished: false,
        setsScore: liveSets || '0-0',
        liveSets: liveSets || '0-0',
        liveGames: liveGames || '',
        livePoints: livePoints || '',
        homeSets: hS,
        awaySets: aS,
        homeGames: hG,
        awayGames: aG,
        homePoints: hP,
        awayPoints: aP,
        summaryText: summaryParts.join('   '),
      };
    }

    if (scoreTokens.length === 1) {
      const liveSets = scoreTokens[0].replace(':', '-');
      const [hS = '', aS = ''] = liveSets.split('-');
      return {
        isLive: true,
        isFinished: false,
        setsScore: liveSets,
        liveSets,
        liveGames: '',
        livePoints: '',
        homeSets: hS,
        awaySets: aS,
        homeGames: '',
        awayGames: '',
        homePoints: '',
        awayPoints: '',
        summaryText: liveSets,
      };
    }
  }

  // ── 2. FINISHED MATCHES (Strictly Set Score, e.g. "2-0", "2-1", "3-1") ──
  // Case A: string contains set prefix like "2:0 (6-4, 6-3)" or "3:1 (6-3, 3-6, 6-4, 6-2)"
  const prefixMatch = clean.match(/^(\d+)[-:](\d+)(?:\s*\((.*)\))?$/);
  if (prefixMatch) {
    const s1 = parseInt(prefixMatch[1], 10);
    const s2 = parseInt(prefixMatch[2], 10);
    if (s1 <= 5 && s2 <= 5 && (s1 > 0 || s2 > 0 || !prefixMatch[3])) {
      const setsStr = `${s1}-${s2}`;
      return {
        isLive: false,
        isFinished: true,
        setsScore: setsStr,
        homeSets: String(s1),
        awaySets: String(s2),
        summaryText: setsStr,
      };
    }
  }

  // Case B: raw set scores like "6-4, 4-6, 6-3, 6-3" -> calculate sets won
  const setMatches = clean.match(/(\d+)[-:](\d+)/g);
  if (setMatches && setMatches.length > 0) {
    let homeWonSets = 0;
    let awayWonSets = 0;
    for (const sm of setMatches) {
      const [g1, g2] = sm.split(/[-:]/).map(Number);
      if (g1 > g2) homeWonSets++;
      else if (g2 > g1) awayWonSets++;
    }
    if (homeWonSets > 0 || awayWonSets > 0) {
      const setsStr = `${homeWonSets}-${awayWonSets}`;
      return {
        isLive: false,
        isFinished: true,
        setsScore: setsStr,
        homeSets: String(homeWonSets),
        awaySets: String(awayWonSets),
        summaryText: setsStr,
      };
    }
  }

  // Fallback: keep clean sets representation
  const cleanSets = clean.replace(':', '-');
  return {
    isLive: false,
    isFinished: true,
    setsScore: cleanSets,
    summaryText: cleanSets,
  };
}

