import { useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header';
import { CompactMatchRow } from './components/CompactMatchRow';
import { MatchAnalysisPage } from './components/match/MatchAnalysisPage';
import { ReferralModal } from './components/ReferralModal';
import { SideBanner } from './components/SideBanner';
import { SignUpStrip } from './components/SignUpStrip';
import { SportsNavSidebar } from './components/SportsNavSidebar';
import { AiTopPickWidget } from './components/AiTopPickWidget';
import type { Prediction, StatsOverviewData, ReferralSite, ContentLayerFlags } from './types';
import { DEFAULT_CONTENT_LAYERS } from './types';
import { Trophy, RefreshCw, Flame, History, Key, Search, Calendar, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { getInitialTimezone, TIMEZONE_KEY, getSurfaceEmoji, matchMatchesDateFilter, getMatchGender, getTournamentPriority } from './utils/formatters';
import { buildMatchSlug, parseMatchParamFromUrl, findMatchByParam } from './utils/seo';

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

function buildAuthHeaders(sessionToken: string | null): HeadersInit {
  const headers: Record<string, string> = {};
  if (sessionToken) {
    // Authorization alone — live Render CORS currently allows this header.
    // Do not send x-ptin-session until backend CORS redeploy includes it.
    headers.Authorization = `Bearer ${sessionToken}`;
  }
  const initData = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initData : undefined;
  if (initData) headers['x-telegram-init-data'] = initData;
  return headers;
}

export function App() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<StatsOverviewData | null>(null);
  const [referralSites, setReferralSites] = useState<ReferralSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [modalInitialStep, setModalInitialStep] = useState<1 | 2>(1);
  const [telegramUser, setTelegramUser] = useState<{
    id?: number;
    first_name?: string;
    username?: string;
    email?: string;
    avatar_url?: string;
    auth_provider?: string;
  } | null>(null);

  const handleOpenRegistrationModal = (step: 1 | 2 = 1) => {
    setModalInitialStep(step);
    setShowReferralModal(true);
  };
  const [webId, setWebId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('ptin_web_session');
    } catch {
      return null;
    }
  });
  const [botUsername, setBotUsername] = useState<string>('admdinbetbetforbot');
  const [webappShortName, setWebappShortName] = useState<string>('app');
  const [isVerified, setIsVerified] = useState(false);
  const [accessMode, setAccessMode] = useState<'FREE' | 'REGISTRATION_REQUIRED' | 'DEPOSIT_REQUIRED'>('REGISTRATION_REQUIRED');
  const [contentLayers, setContentLayers] = useState<ContentLayerFlags>(DEFAULT_CONTENT_LAYERS);
  const [businessActions, setBusinessActions] = useState({
    registration_referral_enabled: true,
    watch_live_enabled: true,
    payment_mode_placeholder_enabled: false,
  });
  const [collapsedTournaments, setCollapsedTournaments] = useState<Record<string, boolean>>({});
  const [selectedMatch, setSelectedMatch] = useState<Prediction | null>(() => {
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.__INITIAL_PREDICTION__ || (window as any).__INITIAL_PREDICTION__) {
        return win.__INITIAL_PREDICTION__ || (window as any).__INITIAL_PREDICTION__;
      }
      if (win.__INITIAL_MATCH__ || (window as any).__INITIAL_MATCH__) {
        return win.__INITIAL_MATCH__ || (window as any).__INITIAL_MATCH__;
      }
    }
    return null;
  });

  const effectiveTrackingId = useMemo(() => {
    if (telegramUser?.id && telegramUser.id > 0) return telegramUser.id;
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      return (window as any).Telegram.WebApp.initDataUnsafe.user.id;
    }
    if (webId) return webId;
    return 'anonymous';
  }, [telegramUser, webId]);

  const isUserRegistered = Boolean(
    telegramUser?.id ||
    telegramUser?.email ||
    (typeof window !== 'undefined' && localStorage.getItem('ptin_web_verified') === 'true')
  );
  const effectiveVerified = isVerified || isUserRegistered;

  const canSeeDeepAnalysis = accessMode === 'FREE' || effectiveVerified || contentLayers.guest_can_see_ai_full;
  const canWatchLive =
    (businessActions.watch_live_enabled !== false) &&
    (accessMode === 'FREE' || effectiveVerified || contentLayers.guest_can_see_watch_live);

  const handleOpenMatchPage = (pred: Prediction) => {
    setSelectedMatch(pred);
    try {
      const isTelegram = Boolean(window.Telegram?.WebApp?.initData);
      const slug = buildMatchSlug(pred);
      const newUrl = isTelegram
        ? `${window.location.pathname}?match=${pred.fixture_id || pred.id}`
        : `/match/${slug}`;
      window.history.pushState({ matchId: pred.fixture_id || pred.id, slug }, '', newUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const handleBackToMatches = () => {
    setSelectedMatch(null);
    try {
      window.history.pushState(null, '', '/');
    } catch {}
  };

  useEffect(() => {
    const onPopState = () => {
      const matchParam = parseMatchParamFromUrl();
      if (matchParam && predictions.length > 0) {
        const found = findMatchByParam(predictions, matchParam);
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
    // Purge deprecated unverified uid key if present
    try {
      localStorage.removeItem('ptin_web_uid');
    } catch {}

    const isTelegramEnv = Boolean(window.Telegram?.WebApp?.initData);

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
              if (res.content_layers) setContentLayers(prev => ({ ...prev, ...res.content_layers }));
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

    // Authenticate web visitor with cryptographically signed server session (if not in Telegram)
    if (!isTelegramEnv) {
      const storedToken = localStorage.getItem('ptin_web_session');
      fetch(`${API_BASE}/auth/web`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken: storedToken }),
      })
        .then(r => r.json())
        .then(res => {
          if (res?.success) {
            if (res.verified !== undefined) setIsVerified(!!res.verified);
            if (res.access_mode) setAccessMode(res.access_mode);
            if (res.content_layers) setContentLayers(prev => ({ ...prev, ...res.content_layers }));
            if (res.sessionToken) {
              setSessionToken(res.sessionToken);
              try {
                localStorage.setItem('ptin_web_session', res.sessionToken);
              } catch {}
            }
            if (res.webId) setWebId(res.webId);
            if (res.telegramUser) {
              setTelegramUser({
                id: res.telegramUser.telegram_id,
                first_name: res.telegramUser.first_name,
                username: res.telegramUser.username,
              });
            }
          }
        })
        .catch(err => {
          console.warn('[Web Auth Error]:', err);
        });
    }

    fetch(`${API_BASE}/config`)
      .then(r => r.json())
      .then(res => {
        if (res?.access_mode) setAccessMode(res.access_mode);
        if (res?.bot_username) setBotUsername(res.bot_username);
        if (res?.webapp_short_name) setWebappShortName(res.webapp_short_name);
        if (res?.content_layers) {
          setContentLayers(prev => ({ ...prev, ...res.content_layers }));
        } else {
          setContentLayers(prev => ({
            ...prev,
            guest_can_see_summary: res.guest_can_see_summary ?? prev.guest_can_see_summary,
            guest_can_see_stats: res.guest_can_see_stats ?? prev.guest_can_see_stats,
            guest_can_see_ai_full: res.guest_can_see_ai_full ?? prev.guest_can_see_ai_full,
            guest_can_see_watch_live: res.guest_can_see_watch_live ?? prev.guest_can_see_watch_live,
            payment_gateway_enabled: res.payment_gateway_enabled ?? prev.payment_gateway_enabled,
            unlock_via_referral: res.unlock_via_referral ?? prev.unlock_via_referral,
          }));
        }
        if (res?.business_actions && typeof res.business_actions === 'object') {
          setBusinessActions(prev => ({ ...prev, ...res.business_actions }));
        }
      })
      .catch(() => {});

    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = (() => {
        try { return localStorage.getItem('ptin_web_session'); } catch { return sessionToken; }
      })();
      const headers = buildAuthHeaders(token || sessionToken);

      const [predRes, statsRes, refRes] = await Promise.all([
        fetch(`${API_BASE}/predictions`, { headers }).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/stats`, { headers }).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/referrals`).then(r => r.json()).catch(() => []),
      ]);

      const loadedPreds: Prediction[] = Array.isArray(predRes)
        ? predRes
        : (Array.isArray(predRes?.predictions) ? predRes.predictions : []);
      if (predRes?.content_layers) setContentLayers(prev => ({ ...prev, ...predRes.content_layers }));
      if (predRes?.verified !== undefined) setIsVerified(!!predRes.verified);
      if (predRes?.access_mode) setAccessMode(predRes.access_mode);

      setPredictions(loadedPreds);
      setStats(statsRes);
      setReferralSites(Array.isArray(refRes) ? refRes : []);

      // Check URL path or query for direct match landing (e.g. /match/:slug or ?match=123)
      try {
        const matchParam = parseMatchParamFromUrl();
        if (matchParam && loadedPreds.length > 0) {
          const matchTarget = findMatchByParam(loadedPreds, matchParam);
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
    return predictions.filter(p => p.status !== 'UPCOMING' && p.status !== 'LIVE');
  }, [predictions]);

  // Dynamic category counts for sidebars & header (100% real active data)
  const counts = useMemo(() => {
    let live = 0;
    let today = 0;
    let atp = 0;
    let wta = 0;

    activePredictions.forEach(p => {
      if (p.status === 'LIVE') live++;
      const dStr = p.match_date || p.published_at;
      if (matchMatchesDateFilter(dStr, 'today', selectedTimezone)) today++;

      const g = getMatchGender(p.tournament_name, p.round_name, `${p.home_name} vs ${p.away_name}`, p.home_name, p.away_name);
      if (g === 'women') wta++;
      else atp++;
    });

    return { live, today, atp, wta };
  }, [activePredictions, selectedTimezone]);

  const displayedList = useMemo(() => {
    const base = activeTab === 'active' ? activePredictions : historyPredictions;
    const query = searchQuery.toLowerCase().trim();

    return base.filter((p: Prediction) => {
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
    
    displayedList.forEach((p: Prediction) => {
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
    <div className="portal-root">
      {/* ── FULL WIDTH TOPBAR (100% WIDTH) ── */}
      <Header
        stats={stats}
        telegramUser={telegramUser}
        selectedTimezone={selectedTimezone}
        onTimezoneChange={handleTimezoneChange}
        isVerified={effectiveVerified}
        accessMode={accessMode}
        onOpenVipModal={handleOpenRegistrationModal}
        genderFilter={genderFilter}
        onGenderFilterChange={setGenderFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        atpCount={counts.atp}
        wtaCount={counts.wta}
      />

      {/* ── 3-COLUMN PORTAL CONTAINER ── */}
      <div className="portal-layout">
        {/* Left Functional Navigation Sidebar (Desktop) */}
        <SportsNavSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          genderFilter={genderFilter}
          onGenderFilterChange={setGenderFilter}
          surfaceFilter={filterChip === 'clay' ? 'clay' : filterChip === 'hard' ? 'hard' : 'all'}
          onSurfaceFilterChange={(s) => setFilterChip(s === 'all' ? 'all' : s)}
          liveCount={counts.live}
          todayCount={counts.today}
          atpCount={counts.atp}
          wtaCount={counts.wta}
          isVerified={effectiveVerified}
          onOpenModal={() => setShowReferralModal(true)}
        />

        {/* Center Main Match Feed Column */}
        <main className="portal-center-feed">
          {/* Mobile Promotional Sign-Up Strip (Only on mobile or unverified) */}
          {!selectedMatch && !effectiveVerified && accessMode !== 'FREE' && (
            <SignUpStrip
              isVerified={effectiveVerified}
              accessMode={accessMode}
              sites={referralSites}
              effectiveId={effectiveTrackingId}
              onOpenModal={handleOpenRegistrationModal}
              apiBase={API_BASE}
              registrationEnabled={businessActions.registration_referral_enabled !== false}
              isLoggedIn={Boolean(telegramUser?.id || telegramUser?.username || telegramUser?.email)}
              userName={telegramUser?.first_name || telegramUser?.username}
            />
          )}

        {selectedMatch ? (
        <MatchAnalysisPage
          prediction={selectedMatch}
          selectedTimezone={selectedTimezone}
          webappApiBase={API_BASE}
          sessionToken={sessionToken}
          isVerified={effectiveVerified}
          accessMode={accessMode}
          referralSites={referralSites}
          trackingId={effectiveTrackingId}
          businessActions={businessActions}
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
              className={`btn-vip-badge ${accessMode === 'FREE' || effectiveVerified ? 'vip-active' : 'vip-locked'}`}
              title="Member Access & Full Dossiers"
            >
              <Key size={13} /> {accessMode === 'FREE' ? 'OPEN ACCESS 🔓' : effectiveVerified ? 'MEMBER ✓' : 'FULL ACCESS 🔓'}
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
                      {/* Columnar Header Legend */}
                      <div className="tournament-column-legend">
                        <span className="col-legend-status">Status / Time</span>
                        <span className="col-legend-players">Players &amp; Odds</span>
                        <span className="col-legend-ai">AI Win Forecast</span>
                        <span className="col-legend-action">Open</span>
                      </div>
                      {tournData.items.map((p) => (
                        <CompactMatchRow
                          key={p.id}
                          prediction={p}
                          selectedTimezone={selectedTimezone}
                          isLocked={!canSeeDeepAnalysis}
                          isSelected={false}
                          onUnlockClick={() => setShowReferralModal(true)}
                          onOpenMatchPage={handleOpenMatchPage}
                          apiBase={API_BASE}
                          referralSites={referralSites}
                          trackingId={effectiveTrackingId}
                          contentLayers={contentLayers}
                          canWatchLive={canWatchLive}
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
                {searchQuery || dateFilter !== 'all' ? 'No matching matches found' : activeTab === 'active' ? 'No Active Matches Right Now' : 'No Settled History Yet'}
              </h3>
              <p className="empty-desc">
                {searchQuery || dateFilter !== 'all' ? 'Try changing your date filter or search terms.' : 'Check back soon for new ATP/WTA match analyses.'}
              </p>
            </div>
          )}
        </>
      )}

        </main>

        {/* Right Sidebar: AI Value Pick + Official Sponsor (Desktop) */}
        <aside className="portal-right-column">
          <AiTopPickWidget
            predictions={predictions}
            onSelectMatch={handleOpenMatchPage}
            isVerified={effectiveVerified}
            onUnlockClick={() => setShowReferralModal(true)}
          />
          <SideBanner
            sites={referralSites}
            effectiveId={effectiveTrackingId}
            onOpenModal={() => setShowReferralModal(true)}
            apiBase={API_BASE}
          />
        </aside>
      </div>

      {/* Referral Partner Registration Modal (2-Step Funnel) */}
      {showReferralModal && (
        <ReferralModal
          sites={referralSites}
          telegramId={telegramUser?.id}
          webId={webId}
          sessionToken={sessionToken}
          botUsername={botUsername}
          webappShortName={webappShortName}
          apiBase={API_BASE}
          initialStep={modalInitialStep}
          currentUser={telegramUser}
          onClose={() => setShowReferralModal(false)}
          onVerified={(newToken, user) => {
            if (newToken) {
              setSessionToken(newToken);
              try {
                localStorage.setItem('ptin_web_session', newToken);
              } catch {}
            }
            if (user) {
              setTelegramUser({
                id: user.telegram_id || user.id,
                first_name: user.first_name || user.name,
                username: user.username,
                email: user.email,
                avatar_url: user.avatar_url || user.picture,
                auth_provider: user.auth_provider || 'google',
              });
            }
            try {
              localStorage.setItem('ptin_web_verified', 'true');
            } catch {}
            setIsVerified(true);
            // Instantly refresh predictions & analytics with verified session
            loadData();
          }}
        />
      )}
    </div>
  );
}
