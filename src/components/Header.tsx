import React from 'react';
import { Globe, TrendingUp } from 'lucide-react';
import type { StatsOverviewData } from '../types';

interface HeaderProps {
  stats: StatsOverviewData | null;
  telegramUser?: { first_name?: string; username?: string } | null;
  selectedTimezone: string;
  onTimezoneChange: (tz: string) => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  stats,
  telegramUser,
  selectedTimezone,
  onTimezoneChange
}) => {
  const userName = telegramUser?.first_name || (telegramUser?.username ? `@${telegramUser.username}` : 'Guest');

  return (
    <header className="header-container">
      {/* Top Identity Row */}
      <div className="header-top-row">
        <div className="header-user-badge">
          {/* Premium tennis racket logo circle */}
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
            <h1 className="header-title">PTIN AI</h1>
            <div className="header-subtitle">
              Pro Tennis Intelligence &nbsp;·&nbsp; Hi, <span className="header-user-highlight">{userName}</span>
            </div>
          </div>
        </div>

        {/* Timezone Selector */}
        <div className="timezone-pill">
          <Globe size={12} color="#d4a843" />
          <select
            value={selectedTimezone}
            onChange={(e) => onTimezoneChange(e.target.value)}
            className="timezone-select"
          >
            <option value="UTC">🌐 UTC</option>
            <option value="Asia/Tehran">🇮🇷 Tehran</option>
            <option value="local">💻 Local</option>
            <option value="Europe/London">🇬🇧 London</option>
            <option value="America/New_York">🇺🇸 New York</option>
          </select>
        </div>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">WIN RATE</div>
            <div className="stat-val stat-val-green">{stats.winRatePct}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">RECORD</div>
            <div className="stat-val" style={{ fontSize: '1.05rem' }}>
              <span className="text-green">{stats.won}W</span>
              <span style={{ color: '#4a6455', margin: '0 2px' }}>—</span>
              <span className="text-rose">{stats.lost}L</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">LIVE PICKS</div>
            <div className="stat-val stat-val-cyan">{stats.upcoming}</div>
          </div>
        </div>
      )}
    </header>
  );
});
