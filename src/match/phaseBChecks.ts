/**
 * Phase B checks — mapping + guest/member model (no deploy).
 * Run: npx --yes tsx src/match/phaseBChecks.ts
 */
import { mapDeepAnalyticsPayload, shortInsightSummary } from './mapDeepAnalytics';
import { findMatchInWebList, resolveWebApiBase } from '../utils/webApi';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function testResolveWebApiBase() {
  assert(resolveWebApiBase('http://localhost:8080/api/webapp') === 'http://localhost:8080/api/web', 'webapp→web');
  assert(resolveWebApiBase('https://example.com/api/web') === 'https://example.com/api/web', 'already web');
  console.log('  ✅ resolveWebApiBase');
}

function testGuestMapping() {
  const mapped = mapDeepAnalyticsPayload({
    verified: false,
    content_locked: true,
    guest_stats_level: 'none',
    data: {
      matchInfo: { player1: 'A', player2: 'B', surface: 'Hard', dataCompletenessPct: 80 },
      p1RollingForm: null,
      p2RollingForm: null,
      h2hSummary: null,
      p1SurfaceMastery: null,
      explanationCards: null,
    },
  });
  assert(mapped.locked === true, 'guest locked');
  assert(mapped.p1Form === null, 'no form');
  assert(mapped.cards.length === 0, 'no cards');
  assert(mapped.previewOnly === false, 'no preview');
  console.log('  ✅ guest deep-analytics mapping (none)');
}

function testPartialGuestMapping() {
  const mapped = mapDeepAnalyticsPayload({
    verified: false,
    content_locked: true,
    guest_stats_level: 'partial',
    data: {
      matchInfo: { player1: 'A', player2: 'B', surface: 'Clay', dataCompletenessPct: 70 },
      p1RollingForm: { playerName: 'A', last5WinRatePct: 60, last10WinRatePct: null, currentStreak: '+2 W', matchesEvaluated: 5 },
      p2RollingForm: { playerName: 'B', last5WinRatePct: 40, last10WinRatePct: null, currentStreak: '-1 L', matchesEvaluated: 5 },
      h2hSummary: { totalPreMatchEncounters: 3, p1Wins: 2, p2Wins: 1 },
      p1SurfaceMastery: null,
      explanationCards: null,
    },
  });
  assert(mapped.locked === true, 'partial locked');
  assert(mapped.previewOnly === true, 'partial preview');
  assert(mapped.p1Form?.last5WinRatePct === 60, 'form');
  assert(mapped.h2h?.total === 3, 'h2h');
  assert(mapped.p1Surface === null, 'no surface');
  console.log('  ✅ guest deep-analytics mapping (partial preview)');
}

function testMemberMapping() {
  const mapped = mapDeepAnalyticsPayload({
    verified: true,
    content_locked: false,
    guest_stats_level: 'none',
    data: {
      matchInfo: { player1: 'A', player2: 'B', surface: 'Hard', dataCompletenessPct: 90 },
      p1RollingForm: { playerName: 'A', last5WinRatePct: 80, last10WinRatePct: 70, currentStreak: '+4 W', matchesEvaluated: 12 },
      p2RollingForm: { playerName: 'B', last5WinRatePct: 50, last10WinRatePct: 55, currentStreak: '-2 L', matchesEvaluated: 10 },
      h2hSummary: { totalPreMatchEncounters: 5, p1Wins: 3, p2Wins: 2 },
      p1SurfaceMastery: { surface: 'Hard', winRatePct: 72, holdRatePct: 85, breakRatePct: 22 },
      p2SurfaceMastery: { surface: 'Hard', winRatePct: 61, holdRatePct: 80, breakRatePct: 18 },
      p1Workload: { fatigueStatusLabel: 'Fresh', energyTankPct: 88, daysSinceLastMatch: 3, acute7dMatchesCount: 1 },
      explanationCards: [{ title: 'Serve edge', description: 'A holds more under pressure', confidence: 'HIGH' }],
    },
  });
  assert(mapped.locked === false, 'member unlocked');
  assert(!!mapped.p1Surface, 'surface');
  assert(mapped.cards.length === 1, 'cards');
  assert(mapped.p1Workload?.fatigueStatusLabel === 'Fresh', 'workload');
  console.log('  ✅ member deep-analytics mapping (full)');
}

function testSummaryAndFind() {
  const s = shortInsightSummary('One. Two. ' + 'x'.repeat(300), 40);
  assert(!!s && s.endsWith('…'), 'truncate');
  assert(s!.length <= 40, 'len');

  const found = findMatchInWebList(
    [
      { id: 1, fixture_id: 10, home_name: 'A', away_name: 'B', predicted_winner: 'A', status: 'UPCOMING', published_at: '', match_title: '' },
      { id: 2, fixture_id: 20, home_name: 'C', away_name: 'D', predicted_winner: 'C', status: 'LIVE', published_at: '', match_title: '' },
    ] as any,
    { id: 9, fixture_id: 20, home_name: 'C', away_name: 'D', predicted_winner: 'C', status: 'LIVE', published_at: '', match_title: '' } as any
  );
  assert(found?.id === 2, 'find by fixture');
  console.log('  ✅ summary truncate + findMatchInWebList');
}

console.log('\nPhase B match-page checks');
testResolveWebApiBase();
testGuestMapping();
testPartialGuestMapping();
testMemberMapping();
testSummaryAndFind();
console.log('\n✅ Phase B checks PASSED\n');
