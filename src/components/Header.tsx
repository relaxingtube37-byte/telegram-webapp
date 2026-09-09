import React from 'react';
import { Globe, Sparkles, CheckCircle, Key, Search, Gift } from 'lucide-react';
import type { StatsOverviewData } from '../types';

interface HeaderProps {
  stats: StatsOverviewData | null;
  telegramUser?: { first_name?: string; username?: string; email?: string; avatar_url?: string } | null;
  selectedTimezone: string;
  onTimezoneChange: (tz: string) => void;
  isVerified?: boolean;
  accessMode?: 'FREE' | 'REGISTRATION_REQUIRED' | 'DEPOSIT_REQUIRED';
  onOpenVipModal?: (initialStep?: 1 | 2) => void;
  genderFilter: 'all' | 'men' | 'women';
  onGenderFilterChange: (g: 'all' | 'men' | 'women') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  atpCount: number;
  wtaCount: number;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  stats,
  telegramUser,
  selectedTimezone,
  onTimezoneChange,
  isVerified = false,
  accessMode = 'REGISTRATION_REQUIRED',
  onOpenVipModal,
  genderFilter,
  onGenderFilterChange,
  searchQuery,
  onSearchChange,
  atpCount,
  wtaCount,
}) => {
  const userName = telegramUser?.first_name || (telegramUser?.username ? `@${telegramUser.username}` : 'Guest');

  return (
    <header className="full-width-header">
      {/* ── TOP MAIN BAR (100% WIDTH) ── */}
      <div className="header-primary-row">
        {/* Brand identity on the left */}
        <div className="header-brand-wrap">
          <div className="header-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="10" r="7" stroke="#d4a843" strokeWidth="1.5" fill="none"/>
              <line x1="12" y1="3" x2="12" y2="17" stroke="#d4a843" strokeWidth="1.2"/>
              <line x1="5" y1="10" x2="19" y2="10" stroke="#d4a843" strokeWidth="1.2"/>
              <line x1="7" y1="5.5" x2="17" y2="14.5" stroke="#d4a843" strokeWidth="0.9" opacity="0.7"/>
              <line x1="17" y1="5.5" x2="7" y2="14.5" stroke="#d4a843" strokeWidth="0.9" opacity="0.7"/>
              <rect x="10.5" y="17" width="3" height="5" rx="1" fill="#d4a843"/>
            </svg>
          </div>
          <div>
            <div className="header-brand-title">PTIN AI</div>
            <div className="header-brand-tagline">
              Pro Tennis Intelligence &nbsp;·&nbsp; Hi, <span className="header-user-highlight">{userName}</span>
            </div>
          </div>
        </div>

        {/* Center Tour Switcher: ATP / WTA (Desktop) */}
        <div className="header-tour-switcher">
          <button
            className={`tour-nav-btn ${genderFilter === 'all' ? 'active' : ''}`}
            onClick={() => onGenderFilterChange('all')}
          >
            <span>All Matches</span>
          </button>
          <button
            className={`tour-nav-btn btn-atp ${genderFilter === 'men' ? 'active' : ''}`}
            onClick={() => onGenderFilterChange('men')}
          >
            <span className="tour-badge-pill tour-pill-atp">ATP</span>
            <span>ATP Men</span>
            {atpCount > 0 && <span className="tour-count-pill">{atpCount}</span>}
          </button>
          <button
            className={`tour-nav-btn btn-wta ${genderFilter === 'women' ? 'active' : ''}`}
            onClick={() => onGenderFilterChange('women')}
          >
            <span className="tour-badge-pill tour-pill-wta">WTA</span>
            <span>WTA Women</span>
            {wtaCount > 0 && <span className="tour-count-pill">{wtaCount}</span>}
          </button>
        </div>

        {/* Right actions: Search, Timezone, VIP Register */}
        <div className="header-right-actions">
          {/* Quick Search */}
          <div className="header-search-wrap">
            <Search size={13} color="#7a9580" />
            <input
              type="text"
              placeholder="Search player..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="header-search-input"
            />
            {searchQuery && (
              <button onClick={() => onSearchChange('')} className="search-clear-btn">✕</button>
            )}
          </div>

          {/* Timezone Selector */}
          <div className="timezone-pill">
            <Globe size={12} color="#d4a843" />
            <select
              value={selectedTimezone}
              onChange={(e) => onTimezoneChange(e.target.value)}
              className="timezone-select"
              aria-label="Select Timezone"
            >
              <option value="UTC">🌐 UTC</option>
              <option value="Asia/Tehran">🇮🇷 Tehran</option>
              <option value="local">💻 Local</option>
              <option value="Europe/London">🇬🇧 London</option>
              <option value="America/New_York">🇺🇸 New York</option>
            </select>
          </div>

          {/* Prominent 2-Step Sign Up / VIP CTA Button */}
          {accessMode === 'FREE' ? (
            <div className="header-vip-pill header-vip-free">
              <Sparkles size={12} />
              <span>FREE ACCESS</span>
            </div>
          ) : isVerified ? (
            <div className="header-vip-pill header-vip-verified">
              <CheckCircle size={13} color="#4ade80" />
              <span>MEMBER ACTIVE ✓</span>
            </div>
          ) : telegramUser ? (
            /* User finished Step 1 (Google/TG) -> Highlight Step 2 (1WIN activation) */
            <button
              onClick={() => onOpenVipModal?.(2)}
              className="header-signup-btn pulse-glow"
              title="Complete Step 2: Activate 1WIN Partner for 500% Welcome Bonus"
              id="header-signup-cta-btn"
              style={{
                background: 'linear-gradient(135deg, #d4a843, #fbbf24)',
                color: '#09090b',
                fontWeight: 800,
                border: '1px solid #f59e0b',
              }}
            >
              <Gift size={13} />
              <span className="header-btn-text">ACTIVATE 1WIN (+500%)</span>
              <span className="header-btn-tag" style={{ background: '#09090b', color: '#fbbf24' }}>STEP 2</span>
            </button>
          ) : (
            /* User hasn't finished Step 1 yet -> Show Google Sign In CTA */
            <button
              onClick={() => onOpenVipModal?.(1)}
              className="header-signup-btn"
              title="Sign in with Google to start activation"
              id="header-signup-cta-btn"
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="header-btn-text">Sign in with Google</span>
              <span className="header-btn-tag">STEP 1</span>
            </button>
          )}
        </div>
      </div>

      {/* ── STATS BAR STRIP ── */}
      {stats && (
        <div className="header-stats-ticker">
          <div className="ticker-item">
            <span className="ticker-label">WIN RATE:</span>
            <span className="ticker-val ticker-val-green">{stats.winRatePct}%</span>
          </div>
          <div className="ticker-divider">•</div>
          <div className="ticker-item">
            <span className="ticker-label">RECORD:</span>
            <span className="ticker-val">
              <span className="text-green">{stats.won}W</span> - <span className="text-rose">{stats.lost}L</span>
            </span>
          </div>
          <div className="ticker-divider">•</div>
          <div className="ticker-item">
            <span className="ticker-label">ACTIVE PICKS:</span>
            <span className="ticker-val ticker-val-gold">{stats.upcoming} Upcoming</span>
          </div>
        </div>
      )}
    </header>
  );
});
