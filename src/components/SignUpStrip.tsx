import React from 'react';
import { Sparkles, CheckCircle, ChevronRight, Gift, ArrowRight, UserCheck } from 'lucide-react';
import type { ReferralSite } from '../types';
import { buildGoReferralUrl, openExternalLink } from '../utils/referralLinks';

interface SignUpStripProps {
  isVerified: boolean;
  accessMode?: 'FREE' | 'REGISTRATION_REQUIRED' | 'DEPOSIT_REQUIRED';
  sites: ReferralSite[];
  effectiveId?: string | number;
  onOpenModal: (initialStep?: 1 | 2) => void;
  onVerified?: () => void;
  apiBase?: string;
  registrationEnabled?: boolean;
  isLoggedIn?: boolean;
  userName?: string;
}

export const SignUpStrip: React.FC<SignUpStripProps> = ({
  isVerified,
  accessMode = 'REGISTRATION_REQUIRED',
  sites,
  effectiveId,
  onOpenModal,
  onVerified,
  apiBase = 'https://telegram-backend-2yck.onrender.com/api/webapp',
  registrationEnabled = true,
  isLoggedIn = false,
  userName,
}) => {
  if (accessMode === 'FREE') {
    return (
      <div className="signup-strip-container strip-free-mode">
        <div className="signup-strip-content">
          <Sparkles size={16} color="#4ade80" />
          <span className="strip-title-text">
            <strong>Open Access Mode Active:</strong> All specialist AI match analyses &amp; tactical dossiers are free to explore.
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
            <strong>Pro Member Access Active:</strong> Full match predictions, simulation models &amp; live stream access unlocked.
          </span>
        </div>
        <span className="strip-vip-pill">VERIFIED ✓</span>
      </div>
    );
  }

  if (!registrationEnabled) return null;

  const isTelegramEnv = Boolean(
    typeof window !== 'undefined' &&
    (window.Telegram?.WebApp?.initData || window.Telegram?.WebApp?.initDataUnsafe?.user?.id)
  );
  const effectiveLoggedIn = isLoggedIn || isTelegramEnv;

  const primary = sites[0];
  const directLink = primary
    ? buildGoReferralUrl(apiBase, primary.id, effectiveId || 'anonymous', {
        action: 'registration',
        page: 'signup_strip',
      })
    : '';

  const handleStep2Click = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('ptin_web_verified', 'true');
      localStorage.setItem('ptin_partner_activated', 'true');
    } catch {}
    if (onVerified) onVerified();
    if (directLink) openExternalLink(directLink);
    else onOpenModal(2);
  };

  return (
    <div className="signup-strip-container strip-promo-mode" id="mobile-signup-strip">
      <div className="strip-glow-accent" />
      <div className="strip-left-section">
        <div className="strip-icon-box">
          {effectiveLoggedIn ? <Gift size={20} color="#fbbf24" /> : <Sparkles size={20} color="#38bdf8" />}
        </div>
        <div className="strip-text-box">
          <div className="strip-badge-row">
            <span className="strip-badge-gold">
              <Gift size={11} /> {effectiveLoggedIn ? '1WIN OFFICIAL SPONSOR' : 'FREE SPONSOR ACCESS'}
            </span>
            <span className={effectiveLoggedIn ? 'strip-badge-green' : 'strip-badge-blue'}>
              {effectiveLoggedIn ? `✓ @${userName || 'Telegram'}` : '100% Free'}
            </span>
          </div>
          <h4 className="strip-headline">
            {effectiveLoggedIn
              ? 'Unlock All AI Predictions (Free 1WIN Registration)'
              : 'Unlock All AI Match Predictions & Tactical Dossiers'}
          </h4>
          <p className="strip-subtext">
            {effectiveLoggedIn
              ? 'Register on 1WIN to claim your 500% welcome bonus and permanently unlock all daily 90%+ AI models.'
              : 'Sponsored by 1WIN. Activate partner or connect your account to permanently unlock full AI models.'}
          </p>
        </div>
      </div>
      <div className="strip-action-section">
        {effectiveLoggedIn ? (
          <button onClick={handleStep2Click} className="strip-btn-primary pulse-glow" id="strip-step2-cta-btn">
            <Gift size={15} /> Unlock Predictions (+500% Bonus)
          </button>
        ) : (
          <button onClick={() => onOpenModal()} className="strip-btn-primary pulse-glow" id="strip-step1-cta-btn" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Sparkles size={15} /> Unlock Full Predictions
          </button>
        )}
      </div>
    </div>
  );
};
