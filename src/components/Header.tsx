import React from 'react';
import { Globe, Sparkles, CheckCircle, Key, Search } from 'lucide-react';
import type { StatsOverviewData } from '../types';

interface HeaderProps {
  stats: StatsOverviewData | null;
  telegramUser?: { first_name?: string; username?: string } | null;
  selectedTimezone: string;
  onTimezoneChange: (tz: string) => void;
  isVerified?: boolean;
  accessMode?: 'FREE' | 'REGISTRATION_REQUIRED' | 'DEPOSIT_REQUIRED';
  onOpenVipModal?: () => void;
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

          {/* Prominent Sign Up / VIP CTA Button */}
          {accessMode === 'FREE' ? (
            <div className="header-vip-pill header-vip-free">
              <Sparkles size={12} />
              <span>FREE ACCESS</span>
            </div>
          ) : isVerified ? (
            <div className="header-vip-pill header-vip-verified">
              <CheckCircle size={12} />
              <span>VIP ACTIVE ✓</span>
            </div>
          ) : (
            <button
              onClick={onOpenVipModal}
              className="header-signup-btn pulse-glow"
              title="Sign Up to Unlock All VIP Predictions"
              id="header-signup-cta-btn"
            >
              <Key size={13} className="header-btn-key" />
              <span className="header-btn-text">Sign Up / VIP</span>
              <span className="header-btn-tag">FREE</span>
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
