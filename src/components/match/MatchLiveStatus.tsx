import React from 'react';
import type { Prediction } from '../../types';
import { parseTennisScore } from '../../utils/formatters';

interface MatchLiveStatusProps {
  status: Prediction['status'];
  resultScore?: string;
}

export const MatchLiveStatus: React.FC<MatchLiveStatusProps> = ({ status, resultScore }) => {
  const parsed = parseTennisScore(resultScore, status);

  if (status === 'LIVE') {
    return (
      <span className="status-tag status-tag-live" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span className="live-pulse-dot" />
        <span style={{ fontWeight: 800 }}>LIVE</span>
        {parsed?.summaryText && (
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, opacity: 0.95, letterSpacing: '0.04em' }}>
            {parsed.summaryText}
          </span>
        )}
      </span>
    );
  }
  if (status === 'WON' || status === 'LOST') {
    const finalScore = parsed?.setsScore || (status === 'WON' ? '2-0' : '0-2');
    return (
      <span style={{ fontWeight: 700, color: status === 'WON' ? '#4ade80' : '#f87171' }}>
        Final {finalScore}
      </span>
    );
  }
  if (status === 'VOID' || status === 'INTERRUPTED') {
    return <span style={{ fontWeight: 700, color: '#fbbf24' }}>{status}</span>;
  }
  return <span style={{ fontWeight: 600 }}>Upcoming</span>;
};

