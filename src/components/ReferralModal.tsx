import React from 'react';
import { ExternalLink, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { ReferralSite } from '../types';

interface ReferralModalProps {
  sites: ReferralSite[];
  telegramId?: number;
  onClose: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ sites, telegramId, onClose }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass" style={{ width: '100%', maxWidth: 420, padding: '1.5rem', background: '#1e293b', border: '1px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldAlert color="var(--accent-amber)" size={20} /> VIP Access & Referral Verification
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '1.2rem' }}>
          Register on one of our official partner bookmakers below. Your Telegram ID (<code>{telegramId || 'User'}</code>) will be automatically passed as SubID for instant auto-verification via Postback!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.2rem' }}>
          {sites.length > 0 ? (
            sites.map(site => {
              const trackingUrl = site.base_url.includes('?')
                ? `${site.base_url}&subid=${telegramId}`
                : `${site.base_url}?subid=${telegramId}`;

              return (
                <a
                  key={site.id}
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ textDecoration: 'none', justifyContent: 'space-between', padding: '0.8rem 1rem' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} /> Register on {site.name}
                  </span>
                  <ExternalLink size={16} />
                </a>
              );
            })
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>
              Official Partner Links Coming Soon. Contact Admin for Manual Access.
            </div>
          )}
        </div>

        <button onClick={onClose} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', padding: '0.6rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
          Close
        </button>
      </div>
    </div>
  );
};
