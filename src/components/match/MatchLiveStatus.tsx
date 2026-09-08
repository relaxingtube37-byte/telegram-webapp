import React from 'react';
import type { Prediction } from '../../types';

interface MatchLiveStatusProps {
  status: Prediction['status'];
  resultScore?: string;
}

export const MatchLiveStatus: React.FC<MatchLiveStatusProps> = ({ status, resultScore }) => {
  const score = (resultScore || '').split('(')[0].trim();

  if (status === 'LIVE') {
    return (
      <span className="status-tag status-tag-live" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span className="live-pulse-dot" /> LIVE
      </span>
    );
  }
  if (status === 'WON' || status === 'LOST') {
    return (
      <span style={{ fontWeight: 700, color: status === 'WON' ? '#4ade80' : '#f87171' }}>
        Final {score || status}
      </span>
    );
  }
  if (status === 'VOID' || status === 'INTERRUPTED') {
    return <span style={{ fontWeight: 700, color: '#fbbf24' }}>{status}</span>;
  }
  return <span style={{ fontWeight: 600 }}>Upcoming</span>;
};
