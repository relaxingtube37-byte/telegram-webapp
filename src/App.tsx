import { useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header';
import { CompactMatchRow } from './components/CompactMatchRow';
import { MatchSeoView } from './components/MatchSeoView';
import { ReferralModal } from './components/ReferralModal';
import type { Prediction, StatsOverviewData, ReferralSite } from './types';
import { Trophy, RefreshCw, Flame, History, Key, Search, Calendar, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { getInitialTimezone, TIMEZONE_KEY, getSurfaceEmoji, matchMatchesDateFilter, getMatchGender, getTournamentPriority } from './utils/formatters';

const PRODUCTION_API_BASE = 'https://telegram-backend-2yck.onrender.com/api/webapp';
const LOCAL_API_BASE = 'http://localhost:8080/api/webapp';

function resolveApiBase(): string {
  const envBase = (import.meta as ImportMeta & { env?: { VITE_API_BASE?: string; DEV?: boolean } }).env?.VITE_API_BASE;
  const isDev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV;

  let base = (envBase || '').trim().replace(/\/+$/, '');
  if (!base) {
    return isDev ? LOCAL_API_BASE : PRODUCTION_API_BASE;
  }

  // Auto-correct common mistakes if user entered domain root without /api/webapp
  if (!base.endsWith('/api/webapp')) {
    if (base.endsWith('/api')) {
      base = `${base}/webapp`;
    } else if (base.endsWith('/webapp')) {
      base = base.replace(/\/webapp$/, '/api/webapp');
    } else {
      base = `${base}/api/webapp`;
    }
  }
  return base;
}

const API_BASE = resolveApiBase();


export function App() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<StatsOverviewData | null>(null);
  const [referralSites, setReferralSites] = useState<ReferralSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [telegramUser, setTelegramUser] = useState<{ id?: number; first_name?: string; username?: string } | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [accessMode, setAccessMode] = useState<'FREE' | 'REGISTRATION_REQUIRED' | 'DEPOSIT_REQUIRED'>('REGISTRATION_REQUIRED');
  const [collapsedTournaments, setCollapsedTournaments] = useState<Record<string, boolean>>({});
  const [selectedMatch, setSelectedMatch] = useState<Prediction | null>(null);

  const handleOpenMatchPage = (pred: Prediction) => {
    setSelectedMatch(pred);
    try {
      const matchParam = pred.fixture_id || pred.id;
      const newUrl = `${window.location.pathname}?match=${matchParam}`;
      window.history.pushState({ matchId: matchParam }, '', newUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const handleBackToMatches = () => {
    setSelectedMatch(null);
    try {
      window.history.pushState(null, '', window.location.pathname);
    } catch {}
  };

  useEffect(() => {
    const onPopState = () => {
      const p = new URLSearchParams(window.location.search);
      const matchId = p.get('match');
      if (matchId && predictions.length > 0) {
        const found = predictions.find(m => String(m.fixture_id) === matchId || String(m.id) === matchId);
        setSelectedMatch(found || null);
      } else {
        setSelectedMatch(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [predictions]);

  const toggleTournament = (tournName: string) => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
    setCollapsedTournaments(prev => ({
      ...prev,
      [tournName]: !prev[tournName]
    }));
  };

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'week'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'men' | 'women'>('all');
  const [filterChip, setFilterChip] = useState<'all' | 'high_prob' | 'clay' | 'hard'>('all');
  const [selectedTimezone, setSelectedTimezone] = useState<string>(getInitialTimezone());

  const handleTimezoneChange = (tz: string) => {
    setSelectedTimezone(tz);
    try {
      localStorage.setItem(TIMEZONE_KEY, tz);
    } catch {}
  };

  useEffect(() => {
    // Initialize Telegram WebApp SDK
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      const rawInitData = tg.initData;
      if (rawInitData) {
        // Authenticate cryptographically using signed Telegram initData
        fetch(`${API_BASE}/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: rawInitData }),
        })
          .then(r => r.json())
          .then(res => {
            if (res?.success) {
              if (res.verified !== undefined) setIsVerified(!!res.verified);
              if (res.access_mode) setAccessMode(res.access_mode);
              if (res.user) {
                setTelegramUser({
                  id: res.user.telegram_id,
                  first_name: res.user.first_name,
                  username: res.user.username,
                });
              }
            }
          })
          .catch(err => {
            console.warn('[Telegram WebApp Auth Error]:', err);
          });
      } else if (tg.initDataUnsafe?.user) {
        // Fallback for local browser dev environment outside Telegram Webview
        setTelegramUser(tg.initDataUnsafe.user);
      }
    }

    fetch(`${API_BASE}/config`)
      .then(r => r.json())
      .then(res => { if (res?.access_mode) setAccessMode(res.access_mode); })
      .catch(() => {});

    // Web visitor verification check (outside Telegram)
    try {
      const webUid = localStorage.getItem('ptin_web_uid');
      if (!window.Telegram?.WebApp?.initData && webUid) {
        fetch(`${API_BASE}/user/${webUid}`)
          .then(r => r.json())
          .then(res => {
            if (res?.verified) setIsVerified(true);
          })
          .catch(() => {});
      }
    } catch {}

    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [predRes, statsRes, refRes] = await Promise.all([
        fetch(`${API_BASE}/predictions`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/stats`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/referrals`).then(r => r.json()).catch(() => []),
      ]);

      const loadedPreds: Prediction[] = Array.isArray(predRes) ? predRes : [];
      setPredictions(loadedPreds);
      setStats(statsRes);
      setReferralSites(Array.isArray(refRes) ? refRes : []);

      // Check URL query for direct match landing (e.g. ?match=123)
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const matchParam = urlParams.get('match');
        if (matchParam && loadedPreds.length > 0) {
          const matchTarget = loadedPreds.find(
            p => String(p.fixture_id) === matchParam || String(p.id) === matchParam
          );
          if (matchTarget) setSelectedMatch(matchTarget);
        }
      } catch {}
    } catch (e) {
      console.warn("Failed to load WebApp predictions data", e);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Predictions
  const activePredictions = useMemo(() => {
    return predictions.filter(p => p.status === 'UPCOMING' || p.status === 'LIVE');
  }, [predictions]);

  const historyPredictions = useMemo(() => {
    return predictions.filter(p => p.status === 'WON' || p.status === 'LOST' || p.status === 'VOID');
  }, [predictions]);

  const displayedList = useMemo(() => {
    const base = activeTab === 'active' ? activePredictions : historyPredictions;
    const query = searchQuery.toLowerCase().trim();

    return base.filter(p => {
      // 1. Search Query Match
      if (query) {
        const home = (p.home_name || '').toLowerCase();
        const away = (p.away_name || '').toLowerCase();
        const tourn = (p.tournament_name || '').toLowerCase();
        const pick = (p.predicted_winner || '').toLowerCase();
        if (!home.includes(query) && !away.includes(query) && !tourn.includes(query) && !pick.includes(query)) {
          return false;
        }
      }

      // 2. Date Filter Match (Today / Tomorrow / Week)
      if (dateFilter !== 'all') {
        const dStr = p.match_date || p.published_at;
        if (!matchMatchesDateFilter(dStr, dateFilter, selectedTimezone)) {
          return false;
        }
      }

      // 3. Gender Filter Match (All / Men / Women)
      if (genderFilter !== 'all') {
        const g = getMatchGender(p.tournament_name, p.round_name, `${p.home_name} vs ${p.away_name}`, p.home_name, p.away_name);
        if (genderFilter === 'men' && g === 'women') return false;
        if (genderFilter === 'women' && g === 'men') return false;
      }

      // 4. Chip Filter Match
      if (filterChip === 'high_prob') {
        if ((p.win_probability || 0) < 70) return false;
      } else if (filterChip === 'clay') {
        if (!(p.surface || '').toLowerCase().includes('clay')) return false;
      } else if (filterChip === 'hard') {
        if (!(p.surface || '').toLowerCase().includes('hard')) return false;
      }

      return true;
    });
  }, [activeTab, activePredictions, historyPredictions, searchQuery, dateFilter, genderFilter, filterChip, selectedTimezone]);

  // Group by Tournament with Tier Priority Sorting (Grand Slams & 1000s First)
  const groupedByTournament = useMemo(() => {
    const groups: Record<string, { surface?: string; items: Prediction[] }> = {};
    
    displayedList.forEach(p => {
      const tourn = p.tournament_name || 'Tennis Tournament';
      if (!groups[tourn]) {
        groups[tourn] = { surface: p.surface, items: [] };
      }
      groups[tourn].items.push(p);
    });

    // Sort items within each tournament (Live matches first, then chronological)
    Object.values(groups).forEach(g => {
      g.items.sort((a, b) => {
        const liveA = a.status === 'LIVE' ? 1 : 0;
        const liveB = b.status === 'LIVE' ? 1 : 0;
        if (liveA !== liveB) return liveB - liveA;

        const timeA = new Date(a.match_date || a.published_at).getTime() || 0;
        const timeB = new Date(b.match_date || b.published_at).getTime() || 0;
        return timeA - timeB;
      });
    });

    // Sort tournament groups by Priority (Grand Slam -> 1000 -> 500 -> 250 -> Challenger -> ITF)
    const sortedKeys = Object.keys(groups).sort((k1, k2) => {
      const p1 = getTournamentPriority(k1);
      const p2 = getTournamentPriority(k2);
      if (p1 !== p2) return p1 - p2;
      return k1.localeCompare(k2);
    });

    const sortedGroups: Record<string, { surface?: string; items: Prediction[] }> = {};
    sortedKeys.forEach(k => {
      sortedGroups[k] = groups[k];
    });

    return sortedGroups;
  }, [displayedList]);

  return (
    <div className="webapp-container">
      {/* Header with Stats & Timezone */}
      <Header
        stats={stats}
        telegramUser={telegramUser}
        selectedTimezone={selectedTimezone}
        onTimezoneChange={handleTimezoneChange}
      />

      {selectedMatch ? (
        <MatchSeoView
          prediction={selectedMatch}
          selectedTimezone={selectedTimezone}
          isLocked={accessMode === 'FREE' ? false : !isVerified}
          onBack={handleBackToMatches}
          onUnlockClick={() => setShowReferralModal(true)}
        />
      ) : (
        <>
          {/* Search Input & Date Filters Row */}
          <div className="search-date-combined-row">
            {/* Search Bar (Half width) */}
            <div className="search-bar-wrapper">
              <Search size={14} color="var(--text-secondary)" className="search-icon" />
              <input
                type="text"
                placeholder="Search player..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="search-clear-btn">✕</button>
              )}
            </div>

            {/* Date Filter Buttons (Today / Tomorrow / Week) */}
            <div className="date-filter-group">
              <button
                className={`date-filter-btn ${dateFilter === 'today' ? 'active' : ''}`}
                onClick={() => setDateFilter(prev => prev === 'today' ? 'all' : 'today')}
              >
                Today
              </button>
              <button
                className={`date-filter-btn ${dateFilter === 'tomorrow' ? 'active' : ''}`}
                onClick={() => setDateFilter(prev => prev === 'tomorrow' ? 'all' : 'tomorrow')}
              >
                Tomorrow
              </button>
              <button
                className={`date-filter-btn ${dateFilter === 'week' ? 'active' : ''}`}
                onClick={() => setDateFilter(prev => prev === 'week' ? 'all' : 'week')}
              >
                Week
              </button>
            </div>
          </div>

          {/* 3 Side-by-Side Category Buttons (All / Men / Women) */}
          <div className="gender-filter-row">
            <button
              className={`gender-filter-btn ${genderFilter === 'all' ? 'active' : ''}`}
              onClick={() => setGenderFilter('all')}
            >
              🎾 All Matches
            </button>
            <button
              className={`gender-filter-btn gender-btn-men ${genderFilter === 'men' ? 'active' : ''}`}
              onClick={() => setGenderFilter('men')}
            >
              👨 Men (ATP)
            </button>
            <button
              className={`gender-filter-btn gender-btn-women ${genderFilter === 'women' ? 'active' : ''}`}
              onClick={() => setGenderFilter('women')}
            >
              👩 Women (WTA)
            </button>
          </div>

          {/* Secondary Filter Chips */}
          <div className="filter-chips-scroll">
            <button
              className={`filter-chip ${filterChip === 'all' ? 'active' : ''}`}
              onClick={() => setFilterChip('all')}
            >
              All Matches
            </button>
            <button
              className={`filter-chip ${filterChip === 'high_prob' ? 'active' : ''}`}
              onClick={() => setFilterChip(prev => prev === 'high_prob' ? 'all' : 'high_prob')}
            >
              🎯 70%+ Win Prob
            </button>
            <button
              className={`filter-chip ${filterChip === 'hard' ? 'active' : ''}`}
              onClick={() => setFilterChip(prev => prev === 'hard' ? 'all' : 'hard')}
            >
              🟦 Hard
            </button>
            <button
              className={`filter-chip ${filterChip === 'clay' ? 'active' : ''}`}
              onClick={() => setFilterChip(prev => prev === 'clay' ? 'all' : 'clay')}
            >
              🧱 Clay
            </button>
          </div>

          {/* Navigation Tabs & Actions Row */}
          <div className="nav-controls-row">
            <div className="nav-tabs">
              <button
                className={`nav-tab ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => setActiveTab('active')}
              >
                🔥 Active ({activePredictions.length})
              </button>
              <button
                className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                📊 History ({historyPredictions.length})
              </button>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="btn-refresh"
              title="Refresh Predictions"
            >
              <RefreshCw size={17} className={loading ? 'spin' : ''} />
            </button>

            <button
              onClick={() => setShowReferralModal(true)}
              className={`btn-vip-badge ${accessMode === 'FREE' || isVerified ? 'vip-active' : 'vip-locked'}`}
            >
              <Key size={13} /> {accessMode === 'FREE' ? 'FREE 🔓' : isVerified ? 'VIP ✓' : 'UNLOCK'}
            </button>
          </div>

          {/* Main Predictions Stream */}
          {loading ? (
            <div className="loading-state">
              <Trophy size={42} className="loading-icon" />
              <div className="loading-text">Loading AI Predictions & Analysis...</div>
            </div>
          ) : Object.keys(groupedByTournament).length > 0 ? (
            Object.entries(groupedByTournament).map(([tournName, tournData]) => {
              const isCollapsed = !!collapsedTournaments[tournName];
              return (
                <div key={tournName} className="tournament-group">
                  {/* Tournament Header (Collapsible Accordion) */}
                  {(() => {
                    const hasWomen = tournData.items.some(p => getMatchGender(p.tournament_name, p.round_name, `${p.home_name} vs ${p.away_name}`, p.home_name, p.away_name) === 'women');
                    const hasMen = tournData.items.some(p => getMatchGender(p.tournament_name, p.round_name, `${p.home_name} vs ${p.away_name}`, p.home_name, p.away_name) === 'men');
                    const tournBadge = (hasWomen && !hasMen) ? 'WTA' : (!hasWomen && hasMen) ? 'ATP' : (hasWomen && hasMen) ? 'ATP/WTA' : (getMatchGender(tournName) === 'women' ? 'WTA' : 'ATP');
                    const isWta = tournBadge === 'WTA';
                    return (
                      <div 
                        className={`tournament-group-header ${isWta ? 'tourn-header-wta' : 'tourn-header-atp'}`}
                        onClick={() => toggleTournament(tournName)}
                        role="button"
                        tabIndex={0}
                        aria-expanded={!isCollapsed}
                      >
                        <div className="tourn-title-left">
                          <span className={`tour-badge-sm ${isWta ? 'tour-badge-wta' : tournBadge === 'ATP/WTA' ? 'tour-badge-mixed' : 'tour-badge-atp'}`}>{tournBadge}</span>
                          <span className="tourn-emoji">{getSurfaceEmoji(tournData.surface)}</span>
                          <span className="tourn-name">{tournName}</span>
                          {tournData.surface && <span className="tourn-surf">• {tournData.surface}</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className="tourn-count">{tournData.items.length}</span>
                          {isCollapsed ? (
                            <ChevronDown size={15} color="var(--text-secondary)" />
                          ) : (
                            <ChevronUp size={15} color={isWta ? '#fb7185' : '#38bdf8'} />
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Match Rows (Shown when not collapsed) */}
                  {!isCollapsed && (
                    <div className="tournament-matches-list">
                      {tournData.items.map((p, idx) => (
                        <CompactMatchRow
                          key={p.id}
                          prediction={p}
                          selectedTimezone={selectedTimezone}
                          isLocked={accessMode === 'FREE' ? false : (!isVerified && idx > 0)}
                          onUnlockClick={() => setShowReferralModal(true)}
                          onOpenMatchPage={handleOpenMatchPage}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="glass empty-state-box">
              <Flame size={44} className="empty-icon" />
              <h3 className="empty-title">
                {searchQuery || dateFilter !== 'all' ? 'No matching matches found' : activeTab === 'active' ? 'No Active Predictions Right Now' : 'No Settled History Yet'}
              </h3>
              <p className="empty-desc">
                {searchQuery || dateFilter !== 'all' ? 'Try changing your date filter or search terms.' : 'Check back soon! New high-EV predictions are posted regularly.'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Referral Partner Registration Modal */}
      {showReferralModal && (
        <ReferralModal
          sites={referralSites}
          telegramId={telegramUser?.id}
          onClose={() => setShowReferralModal(false)}
          onVerified={() => {
            setIsVerified(true);
            setShowReferralModal(false);
          }}
        />
      )}
    </div>
  );
}
