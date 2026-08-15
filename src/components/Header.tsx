import React from 'react';
import { Sparkles, Trophy, Globe, TrendingUp } from 'lucide-react';
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
  const userName = telegramUser?.first_name || (telegramUser?.username ? `@${telegramUser.username}` : 'Tennis Fan');

  return (
    <header className="glass header-container">
      {/* Top Identity Row */}
      <div className="header-top-row">
        <div className="header-user-badge">
          <div className="header-logo-icon">
            <Trophy size={20} color="#0f172a" />
          </div>
          <div>
            <h1 className="header-title">Tennis AI Studio</h1>
            <div className="header-subtitle">
              Hi, <span className="header-user-highlight">{userName}</span>
            </div>
          </div>
        </div>

        {/* Timezone Selector Dropdown */}
        <div className="timezone-pill">
          <Globe size={13} color="#38bdf8" />
          <select
            value={selectedTimezone}
            onChange={(e) => onTimezoneChange(e.target.value)}
            className="timezone-select"
          >
            <option value="UTC">🌐 UTC (Default)</option>
            <option value="Asia/Tehran">🇮🇷 Iran (Tehran)</option>
            <option value="local">💻 Device Local</option>
            <option value="Europe/London">🇬🇧 London</option>
            <option value="America/New_York">🇺🇸 New York</option>
          </select>
        </div>
      </div>

      {/* Accuracy Stats Row */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">WIN RATE</div>
            <div className="stat-val stat-val-green">{stats.winRatePct}%</div>
          </div>
          <div className="stat-card stat-card-border">
            <div className="stat-label">WON / LOST</div>
            <div className="stat-val">
              <span className="text-green">{stats.won}</span> / <span className="text-rose">{stats.lost}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">ACTIVE PICKS</div>
            <div className="stat-val stat-val-cyan">{stats.upcoming}</div>
          </div>
        </div>
      )}
    </header>
  );
});
