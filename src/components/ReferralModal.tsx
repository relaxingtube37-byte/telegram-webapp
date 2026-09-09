import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, X, Gift, ArrowRight } from 'lucide-react';
import type { ReferralSite } from '../types';
import { buildPartnerRegisterUrl, openExternalLink } from '../utils/referralLinks';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

interface ReferralModalProps {
  sites: ReferralSite[];
  telegramId?: number;
  webId?: string | null;
  sessionToken?: string | null;
  botUsername?: string;
  webappShortName?: string;
  apiBase?: string;
  initialStep?: 1 | 2;
  currentUser?: {
    first_name?: string;
    username?: string;
    email?: string;
    avatar_url?: string;
    auth_provider?: string;
  } | null;
  onClose: () => void;
  onVerified?: (newToken?: string, user?: any) => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  sites,
  telegramId,
  webId,
  sessionToken,
  apiBase = 'https://telegram-backend-2yck.onrender.com/api/webapp',
  currentUser,
  onClose,
  onVerified,
}) => {
  const isTgEnvironment = Boolean(
    telegramId ||
    (typeof window !== 'undefined' && (
      window.Telegram?.WebApp?.initData ||
      window.Telegram?.WebApp?.initDataUnsafe?.user?.id
    ))
  );

  const [isCompleted, setIsCompleted] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const { renderGoogleButton } = useGoogleAuth({
    apiBase,
    sessionToken,
    enabled: false,
    onSuccess: (newToken, user) => {
      try {
        localStorage.setItem('ptin_web_verified', 'true');
        localStorage.setItem('ptin_partner_activated', 'true');
      } catch {}
      if (onVerified) {
        onVerified(newToken, user);
      }
      setIsCompleted(true);
    },
    onError: (err) => {
      console.warn('[Google Auth Error]:', err);
    },
  });

  const effectiveId = useMemo(() => {
    if (telegramId && telegramId > 0) return telegramId;
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      return window.Telegram.WebApp.initDataUnsafe.user.id;
    }
    if (webId) return webId;
    return 'anonymous';
  }, [telegramId, webId]);

  const activeUser = currentUser;
  const primarySite = sites[0];

  const trackingUrl = useMemo(() => {
    if (!primarySite) return '';
    return buildPartnerRegisterUrl({
      apiBase,
      sites: [primarySite],
      trackingId: effectiveId || 'anonymous',
      page: 'referral_modal',
    });
  }, [apiBase, primarySite, effectiveId]);

  const completeActivation = useCallback((siteId?: number) => {
    try {
      localStorage.setItem('ptin_web_verified', 'true');
      localStorage.setItem('ptin_partner_activated', 'true');
    } catch {}
    if (onVerified) {
      onVerified(sessionToken || undefined, activeUser);
    }
    // Background sync to backend
    fetch(`${apiBase}/referral/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telegramId: effectiveId !== 'anonymous' ? effectiveId : undefined,
        siteId: siteId || primarySite?.id || 1,
        sessionToken: sessionToken || (typeof window !== 'undefined' ? localStorage.getItem('ptin_web_session') : null),
      }),
    }).catch(() => {});
  }, [apiBase, effectiveId, sessionToken, activeUser, primarySite, onVerified]);

  const handleRegisterAndUnlock = (e: React.MouseEvent) => {
    e.preventDefault();
    completeActivation(primarySite?.id);
    if (trackingUrl) {
      openExternalLink(trackingUrl);
    }
    setIsCompleted(true);
  };

  const handleDirectUnlock = (e: React.MouseEvent) => {
    e.preventDefault();
    completeActivation(primarySite?.id);
    onClose();
  };

  useEffect(() => {
    if (!isTgEnvironment && !currentUser?.email && googleBtnRef.current) {
      renderGoogleButton(googleBtnRef.current);
    }
  }, [isTgEnvironment, currentUser, renderGoogleButton]);

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="referral-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 460, padding: '1.4rem' }}
      >
        {/* Top Header */}
        <div className="ref-modal-header" style={{ marginBottom: '1rem' }}>
          <div className="ref-modal-title-group">
            <div className="ref-modal-icon-badge">
              <Sparkles size={18} color="#d4a843" />
            </div>
            <div>
              <h2 className="ref-modal-title">Unlock Full AI Predictions</h2>
              <p className="ref-modal-subtitle">Free &amp; Instant Access via Official Partner</p>
            </div>
          </div>
          <button onClick={onClose} className="ref-modal-close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {isCompleted ? (
          /* Activation Success Celebration */
          <div style={{
            background: 'rgba(74, 222, 128, 0.08)',
            border: '1px solid rgba(74, 222, 128, 0.4)',
            borderRadius: 12,
            padding: '1.5rem',
            textAlign: 'center',
          }}>
            <div style={{
              display: 'inline-flex',
              padding: '0.6rem',
              background: 'rgba(74, 222, 128, 0.2)',
              borderRadius: '50%',
              marginBottom: '0.8rem',
            }}>
              <CheckCircle2 size={36} color="#4ade80" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#4ade80', margin: '0 0 0.5rem 0' }}>
              🎉 Predictions Unlocked!
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
              Your account is verified. All 90%+ confidence AI predictions, value odds &amp; tactical simulations are now permanently unlocked.
            </p>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%',
                padding: '0.8rem 1.2rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <span>View Predictions</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* 1-Click Unified Partner Unlock Card */
          <div>
            <div style={{
              background: 'rgba(15, 30, 20, 0.9)',
              border: '1px solid rgba(212, 168, 67, 0.35)',
              borderRadius: 12,
              padding: '1.1rem',
              marginBottom: '1rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fbbf24' }}>
                    {primarySite?.name ? primarySite.name.toUpperCase() : '1WIN'}
                  </span>
                  <span className="ref-verified-pill">✓ Official Partner</span>
                </div>
                <span className="ref-bonus-tag" style={{ background: 'linear-gradient(135deg, #d4a843, #fbbf24)', color: '#09090b', fontWeight: 800 }}>
                  🎁 500% Welcome Bonus
                </span>
              </div>

              {/* Concise Perks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.82rem', color: '#e4e4e7', marginBottom: '1.1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ color: '#4ade80', fontWeight: 'bold' }}>✓</span>
                  <span>Instant access to <strong>90%+ AI predictions</strong> &amp; tactical dossiers</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ color: '#4ade80', fontWeight: 'bold' }}>✓</span>
                  <span>Full simulation models &amp; high-value betting odds</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ color: '#4ade80', fontWeight: 'bold' }}>✓</span>
                  <span>Claim a <strong>500% Welcome Bonus</strong> on registration</span>
                </div>
              </div>

              {/* 1-Click Main Button */}
              <button
                type="button"
                onClick={handleRegisterAndUnlock}
                className="ref-btn-register pulse-glow"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                }}
              >
                <Gift size={16} />
                <span>Register on 1WIN &amp; Unlock Predictions</span>
              </button>

              {/* Direct Unlock Alternative */}
              <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleDirectUnlock}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Already registered on 1WIN? Tap here to unlock
                </button>
              </div>
            </div>

            {/* Google 1-Click Connect (Only on Web) */}
            {!isTgEnvironment && !currentUser?.email && (
              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0 0.85rem 0', color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                  <span>or connect with Google</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div ref={googleBtnRef} style={{ minHeight: 40, display: 'flex', justifyContent: 'center' }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
