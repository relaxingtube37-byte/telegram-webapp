import React from 'react';
import { ShieldCheck, ExternalLink, Flame, Send } from 'lucide-react';
import type { ReferralSite } from '../types';

interface SideBannerProps {
  sites: ReferralSite[];
  effectiveId?: string | number;
  onOpenModal: () => void;
}

/** Professional sponsor & community cards for the right-hand sidebar */
export const SideBanner: React.FC<SideBannerProps> = ({ sites, effectiveId, onOpenModal }) => {
  const primarySite = sites[0];

  const backendBase = 'https://telegram-backend-2yck.onrender.com';
  const buildTrackingUrl = (site?: ReferralSite) => {
    if (!site) return '';
    const tid = effectiveId;
    if (tid && tid !== 'anonymous') {
      return `${backendBase}/go/${site.id}/${tid}`;
    }
    return site.base_url || site.referral_url || '';
  };

  const primaryTrackingUrl = buildTrackingUrl(primarySite);

  const handleOpenLink = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!url) {
      onOpenModal();
      return;
    }
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="side-banner-stack">
      {/* ── CARD 1: OFFICIAL SPONSORSHIP CARD ── */}
      <div className="side-sponsor-card">
        <div className="side-sponsor-top">
          <div className="sponsor-verified-tag">
            <ShieldCheck size={13} color="#4ade80" />
            <span>Official Sponsor</span>
          </div>
          <span className="sponsor-perk-badge">100% Free Access</span>
        </div>

        <div className="side-sponsor-brand">
          {primarySite?.name ? primarySite.name.toUpperCase() : '1WIN'}
        </div>

        <div className="side-bonus-pill">
          <Flame size={14} color="#f87171" />
          <span>+500% Deposit Bonus &amp; VIP Unlocked</span>
        </div>

        <p className="side-sponsor-desc">
          Sign up with our official bookmaker partner to automatically unlock full AI win matrices, tactical dossiers and daily value bets with zero subscription fees.
        </p>

        <button
          className="side-sponsor-cta-btn pulse-glow"
          onClick={primaryTrackingUrl ? (e) => handleOpenLink(primaryTrackingUrl, e) : onOpenModal}
          id="side-sponsor-register-btn"
        >
          <ExternalLink size={14} /> Register with {primarySite?.name || '1win'} (Free)
        </button>

        <div className="side-sponsor-auto-sync">
          <span>✓ Tracking ID <code>{effectiveId || 'auto'}</code> automatically linked</span>
        </div>
      </div>

      {/* ── CARD 2: TELEGRAM COMMUNITY & ALERTS ── */}
      <div className="side-tg-card">
        <div className="side-tg-top">
          <div className="side-tg-icon-circle">
            <Send size={15} color="#38bdf8" />
          </div>
          <div>
            <div className="side-tg-heading">Telegram Live Alerts</div>
            <div className="side-tg-subheading">Instant push notifications for high-EV bets</div>
          </div>
        </div>

        <a
          href="https://t.me/admdinbetbetforbot"
          target="_blank"
          rel="noopener noreferrer"
          className="side-tg-link-btn"
          onClick={(e) => {
            if (window.Telegram?.WebApp?.openTelegramLink) {
              e.preventDefault();
              window.Telegram.WebApp.openTelegramLink('https://t.me/admdinbetbetforbot');
            }
          }}
        >
          Join Telegram Channel ↗
        </a>
      </div>
    </div>
  );
};
