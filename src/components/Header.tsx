import React from 'react';
import { Sparkles, Trophy } from 'lucide-react';
import type { StatsOverviewData } from '../types';

interface HeaderProps {
  stats: StatsOverviewData | null;
  telegramUser?: { first_name?: string; username?: string } | null;
}

export const Header: React.FC<HeaderProps> = ({ stats, telegramUser }) => {
  const userName = telegramUser?.first_name || (telegramUser?.username ? `@${telegramUser.username}` : 'Tennis Fan');

  return (
    <header className="glass" style={{ padding: '1.2rem 1rem', marginBottom: '1.2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(56, 189, 248, 0.4)' }}>
            <Trophy size={22} color="#0f172a" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Tennis AI Predictions
            </h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Welcome, <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{userName}</span>
            </div>
          </div>
        </div>

        <div className="badge badge-upcoming" style={{ gap: '0.3rem' }}>
          <Sparkles size={12} /> Live AI Engine
        </div>
      </div>

      {/* Accuracy Quick Stats Bar */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.6rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>WIN RATE</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-green)' }}>{stats.winRatePct}%</div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>WON / LOST</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>
              <span style={{ color: 'var(--accent-green)' }}>{stats.won}</span> / <span style={{ color: 'var(--accent-rose)' }}>{stats.lost}</span>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>UPCOMING</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{stats.upcoming}</div>
          </div>
        </div>
      )}
    </header>
  );
};
