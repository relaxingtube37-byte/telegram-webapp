import { useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header';
import { CompactMatchRow } from './components/CompactMatchRow';
import { ReferralModal } from './components/ReferralModal';
import type { Prediction, StatsOverviewData, ReferralSite } from './types';
import { Trophy, RefreshCw, Flame, History, Key, Search, Calendar, Sparkles } from 'lucide-react';
import { getInitialTimezone, TIMEZONE_KEY, getSurfaceEmoji, matchMatchesDateFilter } from './utils/formatters';

const API_BASE = ((import.meta as any).env?.VITE_API_BASE || 'https://telegram-backend-2yck.onrender.com/api/webapp').replace(/\/+$/, '');

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

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'week'>('all');
  const [filterChip, setFilterChip] = useState<'all' | 'value_bets' | 'high_prob' | 'clay' | 'hard'>('all');
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
      if (tg.initDataUnsafe?.user) {
        const u = tg.initDataUnsafe.user;
        setTelegramUser(u);
        if (u.id) {
          const fn = encodeURIComponent(u.first_name || '');
          const un = encodeURIComponent(u.username || '');
          fetch(`${API_BASE}/user/${u.id}?first_name=${fn}&username=${un}`)
            .then(r => r.json())
            .then(res => {
              if (res?.verified) setIsVerified(true);
              if (res?.access_mode) setAccessMode(res.access_mode);
            })
            .catch(() => {});
        }
      }
    }

    fetch(`${API_BASE}/config`)
      .then(r => r.json())
      .then(res => { if (res?.access_mode) setAccessMode(res.access_mode); })
      .catch(() => {});

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

      setPredictions(Array.isArray(predRes) ? predRes : []);
      setStats(statsRes);
      setReferralSites(Array.isArray(refRes) ? refRes : []);
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

      // 3. Chip Filter Match
      if (filterChip === 'value_bets') {
        if (!p.best_bet_selection) return false;
      } else if (filterChip === 'high_prob') {
        if ((p.win_probability || 0) < 70) return false;
      } else if (filterChip === 'clay') {
        if (!(p.surface || '').toLowerCase().includes('clay')) return false;
      } else if (filterChip === 'hard') {
        if (!(p.surface || '').toLowerCase().includes('hard')) return false;
      }

      return true;
    });
  }, [activeTab, activePredictions, historyPredictions, searchQuery, dateFilter, filterChip, selectedTimezone]);

  // Group by Tournament
  const groupedByTournament = useMemo(() => {
    const groups: Record<string, { surface?: string; items: Prediction[] }> = {};
    displayedList.forEach(p => {
      const tourn = p.tournament_name || 'Tennis Tournament';
      if (!groups[tourn]) {
        groups[tourn] = { surface: p.surface, items: [] };
      }
      groups[tourn].items.push(p);
    });
    return groups;
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

      {/* Filter Chips Bar */}
      <div className="filter-chips-scroll">
        <button
          className={`filter-chip ${filterChip === 'all' ? 'active' : ''}`}
          onClick={() => setFilterChip('all')}
        >
          All Matches
        </button>
        <button
          className={`filter-chip ${filterChip === 'value_bets' ? 'active' : ''}`}
          onClick={() => setFilterChip('value_bets')}
        >
          🔥 Value Bets (EV+)
        </button>
        <button
          className={`filter-chip ${filterChip === 'high_prob' ? 'active' : ''}`}
          onClick={() => setFilterChip('high_prob')}
        >
          🎯 70%+ Win Prob
        </button>
        <button
          className={`filter-chip ${filterChip === 'hard' ? 'active' : ''}`}
          onClick={() => setFilterChip('hard')}
        >
          🟦 Hard
        </button>
        <button
          className={`filter-chip ${filterChip === 'clay' ? 'active' : ''}`}
          onClick={() => setFilterChip('clay')}
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
          <div className="loading-text">Loading AI Predictions & Value Bets...</div>
        </div>
      ) : Object.keys(groupedByTournament).length > 0 ? (
        Object.entries(groupedByTournament).map(([tournName, tournData]) => (
          <div key={tournName} className="tournament-group">
            {/* Tournament Header */}
            <div className="tournament-group-header">
              <div className="tourn-title-left">
                <span className="tourn-emoji">{getSurfaceEmoji(tournData.surface)}</span>
                <span className="tourn-name">{tournName}</span>
                {tournData.surface && <span className="tourn-surf">• {tournData.surface}</span>}
              </div>
              <span className="tourn-count">{tournData.items.length}</span>
            </div>

            {/* Match Rows */}
            <div className="tournament-matches-list">
              {tournData.items.map((p, idx) => (
                <CompactMatchRow
                  key={p.id}
                  prediction={p}
                  selectedTimezone={selectedTimezone}
                  isLocked={accessMode === 'FREE' ? false : (!isVerified && idx > 0)}
                  onUnlockClick={() => setShowReferralModal(true)}
                />
              ))}
            </div>
          </div>
        ))
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
