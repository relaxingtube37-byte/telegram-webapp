import React from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import type { Prediction } from '../../types';
import {
  formatMatchTime,
  formatPlayerDisplayName,
  getMatchGender,
  getSurfaceEmoji,
} from '../../utils/formatters';
import { MatchLiveStatus } from './MatchLiveStatus';

interface MatchHeaderProps {
  match: Prediction;
  selectedTimezone: string;
  onBack: () => void;
  onShare?: () => void;
}

export const MatchHeader: React.FC<MatchHeaderProps> = ({
  match,
  selectedTimezone,
  onBack,
  onShare,
}) => {
  const gender = getMatchGender(
    match.tournament_name,
    match.round_name,
    `${match.home_name} vs ${match.away_name}`,
    match.home_name,
    match.away_name
  );
  const tour = gender === 'women' ? 'WTA' : 'ATP';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            padding: '0.45rem 0.9rem',
            borderRadius: 8,
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> All Matches
        </button>
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: 'var(--accent-cyan)',
              padding: '0.45rem 0.9rem',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Share2 size={15} /> Share
          </button>
        )}
      </div>

      <div className="glass" style={{ padding: '1.2rem 1.3rem', borderRadius: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, color: gender === 'women' ? '#f472b6' : '#38bdf8' }}>{tour}</span>
            <span>•</span>
            <span style={{ fontWeight: 700, color: 'white' }}>{match.tournament_name || 'Tour'}</span>
            {match.round_name && (
              <>
                <span>•</span>
                <span>{match.round_name}</span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
            <span>{getSurfaceEmoji(match.surface)} {match.surface || 'Hard'}</span>
            <span>•</span>
            <span>{formatMatchTime(match.match_date, selectedTimezone)}</span>
            <MatchLiveStatus status={match.status} resultScore={match.result_score} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: 'clamp(1rem, 2.8vw, 1.25rem)', fontWeight: 800, color: 'white' }}>
            {formatPlayerDisplayName(match.home_name)}
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '0.3rem 0.65rem', borderRadius: 999 }}>
            VS
          </div>
          <div style={{ fontSize: 'clamp(1rem, 2.8vw, 1.25rem)', fontWeight: 800, color: 'white', textAlign: 'right' }}>
            {formatPlayerDisplayName(match.away_name)}
          </div>
        </div>
      </div>
    </div>
  );
};
