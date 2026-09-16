import React from 'react';
import { Sparkles, CheckCircle, ChevronRight, Gift, ArrowRight, UserCheck } from 'lucide-react';
import type { ReferralSite } from '../types';
import { buildGoReferralUrl, openExternalLink } from '../utils/referralLinks';
import { useTranslation } from '../i18n';

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
  const { t } = useTranslation();

  if (accessMode === 'FREE') {
    return (
      <div className="signup-strip-container strip-free-mode">
        <div className="signup-strip-content">
          <Sparkles size={16} color="#4ade80" />
          <span className="strip-title-text">
            <strong>{t('signUpStrip.openAccessActive', 'Open Access Mode Active:')}</strong> {t('signUpStrip.openAccessDesc', 'All specialist AI match analyses & tactical dossiers are free to explore.')}
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
            <strong>{t('signUpStrip.memberActive', 'Pro Member Access Active:')}</strong> {t('signUpStrip.memberActiveDesc', 'Full match predictions, simulation models & live stream access unlocked.')}
          </span>
        </div>
        <span className="strip-vip-pill">{t('signUpStrip.verified', 'VERIFIED ✓')}</span>
      </div>
    );
  }

  if (!registrationEnabled) return null;

  const isLoggedOut = typeof window !== 'undefined' && localStorage.getItem('ptin_user_logged_out') === 'true';
  const isTelegramEnv = !isLoggedOut && Boolean(
    typeof window !== 'undefined' &&
    (window.Telegram?.WebApp?.initData || window.Telegram?.WebApp?.initDataUnsafe?.user?.id)
  );
  const effectiveLoggedIn = !isLoggedOut && (isLoggedIn || isTelegramEnv);

  const primary = sites[0];
  const directLink = primary
    ? buildGoReferralUrl(apiBase, primary.id, effectiveId || 'anonymous', {
        action: 'registration',
        page: 'signup_strip',
      })
    : '';

  const handleStep2Click = (e: React.MouseEvent) => {
    e.preventDefault();
    if (directLink) {
      openExternalLink(directLink);
    }
    onOpenModal(2);
  };

  return (
    <div className="signup-strip-container strip-promo-mode" id="mobile-signup-strip">
      <div className="strip-glow-accent" />
      <div className="strip-inner">
        <div className="strip-left-section">
          <div className="strip-icon-box">
            {effectiveLoggedIn ? <Gift size={22} color="#fbbf24" /> : <Sparkles size={22} color="#38bdf8" />}
          </div>
          <div className="strip-text-box">
            <div className="strip-badge-row">
              <span className="strip-badge-gold">
                <Sparkles size={11} /> {effectiveLoggedIn ? t('signUpStrip.step2Activation', 'STEP 2: 1WIN ACTIVATION') : t('signUpStrip.proMemberAccess', 'PRO MEMBER ACCESS')}
              </span>
              <span className={effectiveLoggedIn ? 'strip-badge-green' : 'strip-badge-blue'}>
                {effectiveLoggedIn ? `✓ ${userName || t('signUpStrip.connected', 'Connected')}` : t('sideBanner.freeAccess', '100% Free Access')}
              </span>
            </div>
            <h4 className="strip-headline">
              {effectiveLoggedIn
                ? t('signUpStrip.step2Headline', 'Step 2: Activate 1WIN Partner to Unlock All Match Intelligence')
                : t('signUpStrip.step1Headline', 'Unlock Pro Predictions: 1. Sign In ➔ 2. Activate 1WIN Partner')}
            </h4>
            <p className="strip-subtext">
              {effectiveLoggedIn
                ? t('signUpStrip.step2Subtext', 'Register with 1WIN to claim your 500% welcome bonus and permanently unlock all AI predictions.')
                : t('signUpStrip.step1Subtext', 'Connect your account in 1 click, then complete 1WIN partner activation to get full VIP access.')}
            </p>
          </div>
        </div>
        <div className="strip-action-section">
          {effectiveLoggedIn ? (
            <button onClick={handleStep2Click} className="strip-cta-btn btn-step2 pulse-glow" id="strip-step2-cta-btn">
              <Gift size={15} />
              <span>{t('signUpStrip.activateBtn', 'Activate 1WIN (+500% Bonus)')}</span>
            </button>
          ) : (
            <button onClick={() => onOpenModal(1)} className="strip-cta-btn btn-step1 pulse-glow" id="strip-step1-cta-btn">
              <Sparkles size={15} />
              <span>{t('signUpStrip.unlockBtn', 'Unlock Pro Access (Free)')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
