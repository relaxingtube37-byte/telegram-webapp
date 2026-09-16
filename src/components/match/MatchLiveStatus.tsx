import React from 'react';
import type { Prediction } from '../../types';
import { parseTennisScore } from '../../utils/formatters';
import { useTranslation } from '../../i18n';

interface MatchLiveStatusProps {
  status: Prediction['status'];
  resultScore?: string;
}

export const MatchLiveStatus: React.FC<MatchLiveStatusProps> = ({ status, resultScore }) => {
  const { t } = useTranslation();
  const parsed = parseTennisScore(resultScore, status);

  if (status === 'LIVE') {
    return (
      <span className="status-tag status-tag-live" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span className="live-pulse-dot" />
        <span style={{ fontWeight: 800 }}>{t('liveStatus.live', 'LIVE')}</span>
        {parsed?.summaryText && (
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, opacity: 0.95, letterSpacing: '0.04em' }}>
            {parsed.summaryText}
          </span>
        )}
      </span>
    );
  }

  if (status === 'WON' || status === 'LOST') {
    // Only show score if we actually have a real score — never fabricate
    const finalScore = parsed?.setsScore;
    return (
      <span style={{ fontWeight: 700, color: status === 'WON' ? '#4ade80' : '#f87171' }}>
        {finalScore ? `${t('liveStatus.finished', 'Final')} ${finalScore}` : t('liveStatus.finished', 'Final')}
      </span>
    );
  }

  if (status === 'INTERRUPTED') {
    return <span style={{ fontWeight: 700, color: '#fbbf24' }}>{t('liveStatus.interrupted', 'PAUSED')}</span>;
  }

  if (status === 'POSTPONED') {
    return <span style={{ fontWeight: 700, color: '#94a3b8' }}>{t('liveStatus.postponed', 'POSTPONED')}</span>;
  }

  if (status === 'VOID') {
    const displayScore = resultScore && resultScore !== 'VOID' ? ` (${resultScore})` : '';
    return <span style={{ fontWeight: 700, color: '#f59e0b' }}>{t('matchRow.status.void', 'VOID')}{displayScore}</span>;
  }

  // UPCOMING / default
  return <span style={{ fontWeight: 600 }}>{t('liveStatus.upcoming', 'Upcoming')}</span>;
};



