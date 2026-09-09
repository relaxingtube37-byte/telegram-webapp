import React, { useState, useRef, useEffect } from 'react';
import { Globe, Sparkles, CheckCircle, Search, Gift, ChevronDown, ShieldCheck, LogOut } from 'lucide-react';
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
  onLogout?: () => void;
  effectiveTrackingId?: string | number;
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
  onLogout,
  effectiveTrackingId,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const userName = telegramUser?.first_name || (telegramUser?.username ? `@${telegramUser.username}` : 'Guest');
  const userInitial = (telegramUser?.first_name || telegramUser?.username || 'U').charAt(0).toUpperCase().replace('@', '');

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

        {/* Right actions: Search, Timezone, VIP Register / Profile */}
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

          {/* User Account / Profile Capsule & Trust Menu */}
          <div style={{ position: 'relative' }} ref={profileMenuRef}>
            {telegramUser || isVerified ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                {/* Pending Step 2 Quick CTA (if authenticated but not verified yet) */}
                {!isVerified && accessMode !== 'FREE' && (
                  <button
                    onClick={() => onOpenVipModal?.(2)}
                    className="header-signup-btn pulse-glow"
                    title="Activate 1WIN Partner for 500% Welcome Bonus"
                    style={{
                      background: 'linear-gradient(135deg, #d4a843, #fbbf24)',
                      color: '#09090b',
                      fontWeight: 800,
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.72rem',
                    }}
                  >
                    <Gift size={13} />
                    <span>Activate 1WIN</span>
                  </button>
                )}

                {/* Profile Capsule Button */}
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(prev => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(15, 30, 20, 0.85)',
                    border: `1px solid ${isVerified ? 'rgba(74, 222, 128, 0.45)' : 'rgba(212, 168, 67, 0.45)'}`,
                    padding: '0.28rem 0.65rem 0.28rem 0.35rem',
                    borderRadius: 24,
                    cursor: 'pointer',
                    boxShadow: isVerified ? '0 0 12px rgba(74, 222, 128, 0.15)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                  title="View Profile & Account Security"
                >
                  {/* Avatar with Online Dot */}
                  <div style={{ position: 'relative', width: 26, height: 26 }}>
                    {telegramUser?.avatar_url ? (
                      <img
                        src={telegramUser.avatar_url}
                        alt={userName}
                        style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: isVerified
                          ? 'linear-gradient(135deg, #10b981, #059669)'
                          : 'linear-gradient(135deg, #d4a843, #b45309)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                      }}>
                        {userInitial}
                      </div>
                    )}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: '#4ade80',
                      border: '1.5px solid #060f0a',
                    }} />
                  </div>

                  {/* Name and verified pill */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', maxWidth: 85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {telegramUser?.first_name || (telegramUser?.username ? `@${telegramUser.username}` : 'Member')}
                    </span>
                    <span style={{
                      fontSize: '0.56rem',
                      fontWeight: 800,
                      color: isVerified ? '#4ade80' : '#fbbf24',
                    }}>
                      {isVerified ? 'PRO MEMBER ✓' : 'STEP 2 PENDING'}
                    </span>
                  </div>

                  <ChevronDown size={13} color="var(--text-secondary)" style={{ transform: showProfileMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
              </div>
            ) : (
              /* Guest Sign In Button */
              <button
                onClick={() => onOpenVipModal?.(1)}
                className="header-signup-btn pulse-glow"
                id="header-signup-cta-btn"
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                  color: '#fff',
                  padding: '0.4rem 0.85rem',
                }}
              >
                <Sparkles size={13} />
                <span className="header-btn-text">Sign In / Join</span>
              </button>
            )}

            {/* ── Trust-Enhanced User Profile Dropdown ── */}
            {showProfileMenu && (
              <div
                className="glass"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  zIndex: 100,
                  minWidth: 285,
                  maxWidth: 320,
                  padding: '1.1rem',
                  borderRadius: 14,
                  border: '1px solid rgba(212, 168, 67, 0.35)',
                  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.85)',
                  background: 'rgba(9, 20, 14, 0.98)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Profile Identity Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.9rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--gold)', flexShrink: 0 }}>
                    {telegramUser?.avatar_url ? (
                      <img src={telegramUser.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: '1.15rem',
                      }}>
                        {userInitial}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {telegramUser?.first_name || (telegramUser?.username ? `@${telegramUser.username}` : 'Pro Member')}
                    </div>
                    {telegramUser?.email && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {telegramUser.email}
                      </div>
                    )}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: 4,
                      background: 'rgba(0,0,0,0.45)',
                      padding: '0.12rem 0.5rem',
                      borderRadius: 10,
                      fontSize: '0.62rem',
                      color: 'var(--gold-bright)',
                    }}>
                      <ShieldCheck size={11} color="#4ade80" />
                      <span>Tracking ID: #{effectiveTrackingId || 'anonymous'}</span>
                    </div>
                  </div>
                </div>

                {/* Membership Status Box */}
                <div style={{
                  background: isVerified ? 'rgba(74, 222, 128, 0.08)' : 'rgba(251, 191, 36, 0.08)',
                  border: `1px solid ${isVerified ? 'rgba(74, 222, 128, 0.25)' : 'rgba(251, 191, 36, 0.3)'}`,
                  borderRadius: 10,
                  padding: '0.7rem 0.8rem',
                  marginBottom: '0.85rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isVerified ? '#4ade80' : '#fbbf24' }}>
                      {isVerified ? 'PRO ACCESS: ACTIVE ✓' : 'STEP 2: ACTIVATION PENDING'}
                    </span>
                    <span style={{ fontSize: '0.6rem', background: 'rgba(0,0,0,0.35)', padding: '0.06rem 0.32rem', borderRadius: 4, color: '#4ade80', fontWeight: 700 }}>
                      Verified
                    </span>
                  </div>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    {isVerified
                      ? 'Full 90%+ AI models, tactical simulation dossiers & live feeds permanently unlocked.'
                      : 'Activate 1WIN partner to claim your 500% bonus and auto-unlock full AI predictive models.'}
                  </p>
                  {!isVerified && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenVipModal?.(2);
                      }}
                      style={{
                        width: '100%',
                        marginTop: '0.55rem',
                        padding: '0.45rem',
                        borderRadius: 7,
                        border: 'none',
                        background: 'linear-gradient(135deg, #d4a843, #fbbf24)',
                        color: '#09090b',
                        fontWeight: 800,
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                      }}
                    >
                      Activate 1WIN (+500% Bonus) ➔
                    </button>
                  )}
                </div>

                {/* Trust & Unlocked Features Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.68rem', color: '#d4d4d8', padding: '0.2rem 0.2rem 0.4rem 0.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#4ade80', fontWeight: 'bold' }}>✓</span>
                    <span>90%+ Win Probability Models (Active)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#4ade80', fontWeight: 'bold' }}>✓</span>
                    <span>Deep Tactical Head-to-Head Dossiers</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#4ade80', fontWeight: 'bold' }}>✓</span>
                    <span>256-Bit SSL Encrypted &amp; Non-Custodial</span>
                  </div>
                </div>

                <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.08)', margin: '0.75rem 0' }} />

                {/* Log Out Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout?.();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem',
                    borderRadius: 8,
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    color: '#fb7185',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <LogOut size={13} />
                  <span>Log Out (خروج از حساب)</span>
                </button>
              </div>
            )}
          </div>
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
