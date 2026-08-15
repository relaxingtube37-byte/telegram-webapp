import React from 'react';
import { ExternalLink, CheckCircle2, ShieldAlert, Key, Download } from 'lucide-react';
import type { ReferralSite } from '../types';

interface ReferralModalProps {
  sites: ReferralSite[];
  telegramId?: number;
  onClose: () => void;
  onVerified?: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ sites, telegramId, onClose }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass" style={{ width: '100%', maxWidth: 440, padding: '1.4rem', background: '#121a2c', border: '1px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldAlert color="var(--accent-amber)" size={20} /> VIP Access & Unlock
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '1rem' }}>
          Register on one of our verified partner bookmakers below. Your Telegram ID (<code>{telegramId || 'User'}</code>) is automatically tracked for instant auto-verification!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1.2rem' }}>
          {sites.length > 0 ? (
            sites.map(site => {
              const tid = telegramId || window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 0;
              
              // Build tracking URLs
              const backendBase = 'https://telegram-backend-2yck.onrender.com';
              const trackingUrl = tid ? `${backendBase}/go/${site.id}/${tid}` : site.base_url;

              let appTrackingUrl = site.app_url || '';
              if (appTrackingUrl && tid) {
                const sep = appTrackingUrl.includes('?') ? '&' : '?';
                appTrackingUrl = `${appTrackingUrl}${sep}subid=${tid}&sub1=${tid}`;
              }

              const handleOpenWeb = (e: React.MouseEvent) => {
                e.preventDefault();
                if (window.Telegram?.WebApp?.openLink) {
                  window.Telegram.WebApp.openLink(trackingUrl);
                } else {
                  window.open(trackingUrl, '_blank', 'noopener,noreferrer');
                }
              };

              const handleOpenApp = (e: React.MouseEvent) => {
                e.preventDefault();
                if (window.Telegram?.WebApp?.openLink) {
                  window.Telegram.WebApp.openLink(appTrackingUrl);
                } else {
                  window.open(appTrackingUrl, '_blank', 'noopener,noreferrer');
                }
              };

              return (
                <div key={site.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', background: 'rgba(15,23,42,0.6)', padding: '0.8rem', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'white' }}>{site.name}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--accent-green)', fontWeight: 700, background: 'rgba(34, 197, 94, 0.15)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                      Verified Partner
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 4 }}>
                    <button
                      onClick={handleOpenWeb}
                      className="btn-primary"
                      style={{ flex: 1, fontSize: '0.78rem', padding: '0.55rem' }}
                    >
                      <ExternalLink size={13} /> Register Website
                    </button>
                    {appTrackingUrl && (
                      <button
                        onClick={handleOpenApp}
                        style={{ flex: 1, fontSize: '0.78rem', padding: '0.55rem', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontWeight: 700 }}
                      >
                        <Download size={13} /> Android App
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              No active referral partners available at the moment.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-cyan)', background: 'rgba(56, 189, 248, 0.08)', padding: '0.6rem 0.8rem', borderRadius: 8 }}>
          <CheckCircle2 size={16} /> Instant VIP unlock after registration
        </div>
      </div>
    </div>
  );
};
