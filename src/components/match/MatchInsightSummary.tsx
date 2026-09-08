import React from 'react';
import { Sparkles } from 'lucide-react';

interface MatchInsightSummaryProps {
  summary: string | null;
  loading?: boolean;
}

export const MatchInsightSummary: React.FC<MatchInsightSummaryProps> = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="glass" style={{ padding: '1rem 1.15rem', borderRadius: 12, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        Loading AI summary…
      </div>
    );
  }
  if (!summary) return null;

  return (
    <div className="glass" style={{ padding: '1rem 1.15rem', borderRadius: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        <Sparkles size={14} /> AI insight summary
      </div>
      <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.55, color: '#e2e8f0' }}>{summary}</p>
    </div>
  );
};
