export interface RollingFormView {
  playerName: string;
  last5WinRatePct: number | null;
  last10WinRatePct: number | null;
  currentStreak: string | null;
  matchesEvaluated: number | null;
  recentScores?: string[];
}

export interface H2HView {
  total: number;
  p1Wins: number;
  p2Wins: number;
}

export interface SurfaceView {
  surface: string;
  winRatePct: number | null;
  holdRatePct: number | null;
  breakRatePct: number | null;
}

export interface WorkloadView {
  fatigueStatusLabel: string | null;
  energyTankPct: number | null;
  daysSinceLastMatch: number | null;
  acute7dMatchesCount: number | null;
}

export interface ClutchView {
  decidingSetWinRatePct: number | null;
  tiebreakWinRatePct: number | null;
  breakPointsSavedPct: number | null;
  breakPointsConvertedPct: number | null;
  clutchIndexScore: number | null;
}

export interface MatchupGapsView {
  p1ServeVsP2ReturnEdge: number | null;
  p2ServeVsP1ReturnEdge: number | null;
  p1AceAvg: number | null;
  p2AceAvg: number | null;
  p1DfAvg: number | null;
  p2DfAvg: number | null;
  rankDelta: number | null;
}

export interface ExplanationCardView {
  title: string;
  description: string;
  tag?: string;
  confidence?: string;
}

export interface MappedDeepAnalytics {
  locked: boolean;
  guestStatsLevel: 'none' | 'partial' | 'full' | string;
  matchInfo: {
    player1: string;
    player2: string;
    surface: string;
    dataCompletenessPct: number | null;
  } | null;
  p1Form: RollingFormView | null;
  p2Form: RollingFormView | null;
  h2h: H2HView | null;
  p1Surface: SurfaceView | null;
  p2Surface: SurfaceView | null;
  p1Workload: WorkloadView | null;
  p2Workload: WorkloadView | null;
  p1Clutch: ClutchView | null;
  p2Clutch: ClutchView | null;
  matchupGaps: MatchupGapsView | null;
  cards: ExplanationCardView[];
  previewOnly: boolean;
}

function asNum(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function mapForm(raw: any): RollingFormView | null {
  if (!raw || typeof raw !== 'object') return null;
  return {
    playerName: String(raw.playerName || 'Player'),
    last5WinRatePct: asNum(raw.last5WinRatePct),
    last10WinRatePct: asNum(raw.last10WinRatePct),
    currentStreak: raw.currentStreak != null ? String(raw.currentStreak) : null,
    matchesEvaluated: asNum(raw.matchesEvaluated),
    recentScores: Array.isArray(raw.recentScores) ? raw.recentScores : [],
  };
}

function mapSurface(raw: any): SurfaceView | null {
  if (!raw || typeof raw !== 'object') return null;
  return {
    surface: String(raw.surface || 'Hard'),
    winRatePct: asNum(raw.winRatePct),
    holdRatePct: asNum(raw.holdRatePct),
    breakRatePct: asNum(raw.breakRatePct),
  };
}

function mapWorkload(raw: any): WorkloadView | null {
  if (!raw || typeof raw !== 'object') return null;
  return {
    fatigueStatusLabel: raw.fatigueStatusLabel != null ? String(raw.fatigueStatusLabel) : null,
    energyTankPct: asNum(raw.energyTankPct),
    daysSinceLastMatch: asNum(raw.daysSinceLastMatch),
    acute7dMatchesCount: asNum(raw.acute7dMatchesCount),
  };
}

function mapClutch(raw: any): ClutchView | null {
  if (!raw || typeof raw !== 'object') return null;
  return {
    decidingSetWinRatePct: asNum(raw.decidingSetWinRatePct),
    tiebreakWinRatePct: asNum(raw.tiebreakWinRatePct),
    breakPointsSavedPct: asNum(raw.breakPointsSavedPct),
    breakPointsConvertedPct: asNum(raw.breakPointsConvertedPct),
    clutchIndexScore: asNum(raw.clutchIndexScore),
  };
}

function mapGaps(raw: any): MatchupGapsView | null {
  if (!raw || typeof raw !== 'object') return null;
  return {
    p1ServeVsP2ReturnEdge: asNum(raw.p1ServeVsP2ReturnEdge),
    p2ServeVsP1ReturnEdge: asNum(raw.p2ServeVsP1ReturnEdge),
    p1AceAvg: asNum(raw.p1AceAvg),
    p2AceAvg: asNum(raw.p2AceAvg),
    p1DfAvg: asNum(raw.p1DfAvg),
    p2DfAvg: asNum(raw.p2DfAvg),
    rankDelta: asNum(raw.rankDelta),
  };
}

/**
 * Maps Phase A deep-analytics payload (full or redacted) into a stable UI model.
 */
export function mapDeepAnalyticsPayload(input: {
  content_locked?: boolean;
  guest_stats_level?: string;
  verified?: boolean;
  data?: Record<string, unknown> | null;
}): MappedDeepAnalytics {
  const rawData = (input.data || {}) as any;
  // Transparently unpack teaser fields if present (for non-verified guests)
  const data = (rawData.teaser && typeof rawData.teaser === 'object')
    ? { ...rawData, ...rawData.teaser }
    : rawData;

  const locked = input.content_locked === true && input.verified !== true;
  const level = (input.guest_stats_level || 'none') as string;

  const p1Form = mapForm(data.p1RollingForm);
  const p2Form = mapForm(data.p2RollingForm);
  const h2hRaw = data.h2hSummary;
  const h2h: H2HView | null =
    h2hRaw && typeof h2hRaw === 'object'
      ? {
          total: asNum(h2hRaw.totalPreMatchEncounters) ?? 0,
          p1Wins: asNum(h2hRaw.p1Wins) ?? 0,
          p2Wins: asNum(h2hRaw.p2Wins) ?? 0,
        }
      : null;

  const cardsRaw = Array.isArray(data.explanationCards) ? data.explanationCards : [];
  const cards: ExplanationCardView[] = cardsRaw.map((c: any) => ({
    title: String(c.title || 'Insight'),
    description: String(c.description || c.body || ''),
    tag: c.tag ? String(c.tag) : undefined,
    confidence: c.confidence ? String(c.confidence) : undefined,
  }));

  const matchInfo = data.matchInfo
    ? {
        player1: String(data.matchInfo.player1 || ''),
        player2: String(data.matchInfo.player2 || ''),
        surface: String(data.matchInfo.surface || 'Hard'),
        dataCompletenessPct: asNum(data.matchInfo.dataCompletenessPct),
      }
    : null;

  const hasPartialPreview = !!(p1Form || p2Form || h2h);

  return {
    locked,
    guestStatsLevel: level,
    matchInfo,
    p1Form,
    p2Form,
    h2h,
    p1Surface: mapSurface(data.p1SurfaceMastery),
    p2Surface: mapSurface(data.p2SurfaceMastery),
    p1Workload: mapWorkload(data.p1Workload),
    p2Workload: mapWorkload(data.p2Workload),
    p1Clutch: mapClutch(data.p1Clutch),
    p2Clutch: mapClutch(data.p2Clutch),
    matchupGaps: mapGaps(data.matchupGaps),
    cards,
    previewOnly: locked && hasPartialPreview,
  };
}

export function shortInsightSummary(aiSummary?: string | null, maxLen = 220): string | null {
  if (!aiSummary) return null;
  const cleaned = String(aiSummary).replace(/\s+/g, ' ').trim();
  if (!cleaned) return null;
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 1)}…`;
}
