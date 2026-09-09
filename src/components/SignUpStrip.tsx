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
            <strong>دسترسی آزاد فعال است:</strong> تمام تحلیل‌های تخصصی و شبیه‌سازی‌های هوش مصنوعی آزاد هستند.
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
            <strong>عضویت ویژه فعال است:</strong> دسترسی نامحدود به پیش‌بینی‌های ۹۰٪+، شبیه‌سازی و پخش زنده فعال شد.
          </span>
        </div>
        <span className="strip-vip-pill">تایید شده ✓</span>
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

  const handleStep2Click = (e: React.MouseEvent) => {
    e.preventDefault();
    if (directLink) openExternalLink(directLink);
    else onOpenModal(2);
  };

  return (
    <div className="signup-strip-container strip-promo-mode" id="mobile-signup-strip">
      <div className="strip-glow-accent" />
      <div className="strip-left-section">
        <div className="strip-icon-box">
          {isLoggedIn ? <Gift size={20} color="#fbbf24" /> : <UserCheck size={20} color="#38bdf8" />}
        </div>
        <div className="strip-text-box">
          <div className="strip-badge-row">
            <span className="strip-badge-gold">
              <Sparkles size={11} /> {isLoggedIn ? 'گام ۲: فعال‌سازی نهایی' : 'ثبت‌نام ۲ مرحله‌ای'}
            </span>
            <span className={isLoggedIn ? 'strip-badge-green' : 'strip-badge-blue'}>
              {isLoggedIn ? `✓ متصل به نام ${userName || 'شما'}` : '۱۰۰٪ رایگان'}
            </span>
          </div>
          <h4 className="strip-headline">
            {isLoggedIn
              ? 'گام ۲: فعال‌سازی در وان‌وین و باز شدن مادام‌العمر تمام پیش‌بینی‌ها'
              : 'مسیر فعال‌سازی دسترسی کامل: ۱. ورود با گوگل ➔ ۲. ثبت‌نام در اسپانسر'}
          </h4>
          <p className="strip-subtext">
            {isLoggedIn
              ? 'با ثبت‌نام در 1WIN، بونوس ۵۰۰٪ دریافت کرده و تحلیل‌های پیشرفته به‌صورت خودکار باز می‌شوند.'
              : 'ابتدا با ۱ کلیک هویت خود را با گوگل ثبت کنید و سپس دسترسی کامل را دریافت نمایید.'}
          </p>
        </div>
      </div>
      <div className="strip-action-section">
        {isLoggedIn ? (
          <>
            <button onClick={handleStep2Click} className="strip-btn-primary pulse-glow" id="strip-step2-cta-btn">
              <Gift size={14} /> فعال‌سازی در 1WIN (+۵۰۰٪ بونوس)
            </button>
            <button onClick={() => onOpenModal(2)} className="strip-btn-secondary" title="مشاهده جزییات">
              راهنما <ChevronRight size={13} />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onOpenModal(1)} className="strip-btn-primary" id="strip-step1-cta-btn" style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)' }}>
              <ArrowRight size={14} /> ورود با گوگل (گام ۱)
            </button>
            <button onClick={() => onOpenModal(1)} className="strip-btn-secondary" title="مشاهده مراحل">
              مراحل ۲ گانه <ChevronRight size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
