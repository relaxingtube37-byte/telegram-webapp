import React from 'react';
import { Sparkles, Key, CheckCircle, ChevronRight, Gift } from 'lucide-react';
import type { ReferralSite } from '../types';

interface SignUpStripProps {
  isVerified: boolean;
  accessMode?: 'FREE' | 'REGISTRATION_REQUIRED' | 'DEPOSIT_REQUIRED';
  sites: ReferralSite[];
  effectiveId?: string | number;
  onOpenModal: () => void;
}

export const SignUpStrip: React.FC<SignUpStripProps> = ({
  isVerified,
  accessMode = 'REGISTRATION_REQUIRED',
  sites,
  effectiveId,
  onOpenModal,
}) => {
  // If accessMode is FREE, show free access badge
  if (accessMode === 'FREE') {
    return (
      <div className="signup-strip-container strip-free-mode">
        <div className="signup-strip-content">
          <Sparkles size={16} color="#4ade80" />
          <span className="strip-title-text">
            <strong>Open Access Mode Active:</strong> All AI predictions &amp; tactical dossiers are currently free to explore!
          </span>
        </div>
      </div>
    );
  }

  // If user is verified VIP
  if (isVerified) {
    return (
      <div className="signup-strip-container strip-verified-mode">
        <div className="signup-strip-content">
          <CheckCircle size={16} color="#4ade80" />
          <span className="strip-title-text">
            <strong>VIP Active:</strong> All AI Predictions, Win Probability Matrices &amp; Value Bets Unlocked.
          </span>
        </div>
        <span className="strip-vip-pill">VIP ✓</span>
      </div>
    );
  }

  const primarySite = sites[0];
  const backendBase = 'https://telegram-backend-2yck.onrender.com';
  const directLink = primarySite
    ? (effectiveId && effectiveId !== 'anonymous'
        ? `${backendBase}/go/${primarySite.id}/${effectiveId}`
        : primarySite.base_url || primarySite.referral_url)
    : '';

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (directLink) {
      if (window.Telegram?.WebApp?.openLink) {
        window.Telegram.WebApp.openLink(directLink);
      } else {
        window.open(directLink, '_blank', 'noopener,noreferrer');
      }
    } else {
      onOpenModal();
    }
  };

  return (
    <div className="signup-strip-container strip-promo-mode" id="mobile-signup-strip">
      <div className="strip-glow-accent" />

      <div className="strip-left-section">
        <div className="strip-icon-box">
          <Gift size={20} color="#d4a843" />
        </div>
        <div className="strip-text-box">
          <div className="strip-badge-row">
            <span className="strip-badge-gold">
              <Sparkles size={11} /> 100% FREE VIP ACCESS
            </span>
            <span className="strip-badge-green">Instant Unlock</span>
          </div>
          <h4 className="strip-headline">
            Register on Partner Site to Unlock All AI Predictions
          </h4>
          <p className="strip-subtext">
            Get access to 73% Win-Rate AI picks, value bets &amp; tactical dossiers with zero subscription fees.
          </p>
        </div>
      </div>

      <div className="strip-action-section">
        <button
          onClick={handleRegisterClick}
          className="strip-btn-primary"
          id="strip-register-cta-btn"
        >
          <Key size={14} /> Register &amp; Unlock
        </button>
        <button
          onClick={onOpenModal}
          className="strip-btn-secondary"
          title="See step-by-step instructions"
        >
          How it works <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};
