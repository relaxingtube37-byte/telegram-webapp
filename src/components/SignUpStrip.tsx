import React from 'react';
import { Sparkles, Key, CheckCircle, ChevronRight, Gift } from 'lucide-react';
import type { ReferralSite } from '../types';
import { buildGoReferralUrl, openExternalLink } from '../utils/referralLinks';

interface SignUpStripProps {
  isVerified: boolean;
  accessMode?: 'FREE' | 'REGISTRATION_REQUIRED' | 'DEPOSIT_REQUIRED';
  sites: ReferralSite[];
  effectiveId?: string | number;
  onOpenModal: () => void;
  apiBase?: string;
  registrationEnabled?: boolean;
}

export const SignUpStrip: React.FC<SignUpStripProps> = ({
  isVerified,
  accessMode = 'REGISTRATION_REQUIRED',
  sites,
  effectiveId,
  onOpenModal,
  apiBase = 'https://telegram-backend-2yck.onrender.com/api/webapp',
  registrationEnabled = true,
}) => {
  if (accessMode === 'FREE') {
    return (
      <div className="signup-strip-container strip-free-mode">
        <div className="signup-strip-content">
          <Sparkles size={16} color="#4ade80" />
          <span className="strip-title-text">
            <strong>Open Access Mode Active:</strong> All AI match analyses &amp; tactical dossiers are currently free to explore!
          </span>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="signup-strip-container strip-verified-mode">
        <div className="signup-strip-content">
          <CheckCircle size={16} color="#4ade80" />
          <span className="strip-title-text">
            <strong>Member access:</strong> Full match analytics, form stats &amp; AI dossiers unlocked.
          </span>
        </div>
        <span className="strip-vip-pill">ACTIVE ✓</span>
      </div>
    );
  }

  if (!registrationEnabled) return null;

  const primary = sites[0];
  const directLink = primary
    ? buildGoReferralUrl(apiBase, primary.id, effectiveId || 'anonymous', {
        action: 'registration',
        page: 'signup_strip',
      })
    : '';

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (directLink) openExternalLink(directLink);
    else onOpenModal();
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
              <Sparkles size={11} /> MEMBER ACCESS
            </span>
            <span className="strip-badge-green">Full analysis</span>
          </div>
          <h4 className="strip-headline">
            Register with our partner to unlock deeper match analytics
          </h4>
          <p className="strip-subtext">
            Access form, surface, H2H and AI dossiers — no subscription fee on this site.
          </p>
        </div>
      </div>
      <div className="strip-action-section">
        <button onClick={handleRegisterClick} className="strip-btn-primary" id="strip-register-cta-btn">
          <Key size={14} /> Register for full analysis
        </button>
        <button onClick={onOpenModal} className="strip-btn-secondary" title="See step-by-step instructions">
          How it works <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};
