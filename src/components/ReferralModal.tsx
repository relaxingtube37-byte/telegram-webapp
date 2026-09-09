import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { CheckCircle2, Sparkles, X, Gift, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
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
  initialStep,
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

  const [justConnectedUser, setJustConnectedUser] = useState<any | null>(null);
  const activeUser = currentUser || justConnectedUser;

  const isUserAuthenticated = Boolean(
    isTgEnvironment ||
    telegramId ||
    activeUser?.email ||
    activeUser?.username
  );

  // Default to step 2 if already authenticated, else step 1
  const [currentStep, setCurrentStep] = useState<1 | 2>(() => {
    if (initialStep) return initialStep;
    return isUserAuthenticated ? 2 : 1;
  });

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
      setJustConnectedUser(user);
      if (onVerified) {
        onVerified(newToken, user);
      }
      // Auto-advance smoothly to Step 2 (1WIN Partner Activation)
      setCurrentStep(2);
    },
    onError: (err) => {
      console.warn('[Google Auth Error]:', err);
    },
  });

  const effectiveId = useMemo(() => {
    if (telegramId && telegramId > 0) return telegramId;
    if (justConnectedUser?.telegram_id) return justConnectedUser.telegram_id;
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      return window.Telegram.WebApp.initDataUnsafe.user.id;
    }
    if (webId) return webId;
    return 'anonymous';
  }, [telegramId, justConnectedUser, webId]);

  const primarySite = sites[0];

  const trackingUrl = useMemo(() => {
    if (!primarySite) return '';
    return buildPartnerRegisterUrl({
      apiBase,
      sites: [primarySite],
      trackingId: effectiveId || 'anonymous',
      page: 'referral_modal_step2',
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
    setIsCompleted(true);
  };

  useEffect(() => {
    if (!isTgEnvironment && !isUserAuthenticated && currentStep === 1 && googleBtnRef.current) {
      renderGoogleButton(googleBtnRef.current);
    }
  }, [isTgEnvironment, isUserAuthenticated, currentStep, renderGoogleButton]);

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
        style={{ maxWidth: 480, padding: '1.4rem' }}
      >
        {/* Modal Header */}
        <div className="ref-modal-header" style={{ marginBottom: '1rem' }}>
          <div className="ref-modal-title-group">
            <div className="ref-modal-icon-badge">
              <Sparkles size={18} color="#d4a843" />
            </div>
            <div>
              <h2 className="ref-modal-title">Unlock Pro AI Predictions</h2>
              <p className="ref-modal-subtitle">2-Step Access: 1. Sign In ➔ 2. Activate Partner</p>
            </div>
          </div>
          <button onClick={onClose} className="ref-modal-close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* ── 2-Step Modern Stepper Tabs ── */}
        {!isCompleted && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.1rem',
            background: 'rgba(0, 0, 0, 0.35)',
            padding: '0.45rem 0.65rem',
            borderRadius: 10,
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            {/* Step 1 Tab Button */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.4rem 0.6rem',
                background: currentStep === 1
                  ? 'rgba(56, 189, 248, 0.16)'
                  : isUserAuthenticated
                  ? 'rgba(74, 222, 128, 0.1)'
                  : 'transparent',
                border: `1px solid ${currentStep === 1 ? '#38bdf8' : isUserAuthenticated ? '#4ade80' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 8,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: 800,
                background: isUserAuthenticated ? '#4ade80' : currentStep === 1 ? '#38bdf8' : '#27272a',
                color: isUserAuthenticated || currentStep === 1 ? '#09090b' : '#a1a1aa',
              }}>
                {isUserAuthenticated ? '✓' : '1'}
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: currentStep === 1 ? '#38bdf8' : isUserAuthenticated ? '#4ade80' : '#d4d4d8' }}>
                  Step 1: Account
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>
                  {isUserAuthenticated ? 'Connected ✓' : 'Google Sign In'}
                </div>
              </div>
            </button>

            <span style={{ color: 'rgba(212, 168, 67, 0.6)', fontWeight: 800 }}>➔</span>

            {/* Step 2 Tab Button */}
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.4rem 0.6rem',
                background: currentStep === 2
                  ? 'rgba(212, 168, 67, 0.18)'
                  : 'transparent',
                border: `1px solid ${currentStep === 2 ? '#fbbf24' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 8,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: 800,
                background: currentStep === 2 ? '#fbbf24' : '#27272a',
                color: currentStep === 2 ? '#09090b' : '#a1a1aa',
              }}>
                2
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: currentStep === 2 ? '#fbbf24' : '#d4d4d8' }}>
                  Step 2: 1WIN
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>
                  500% Bonus
                </div>
              </div>
            </button>
          </div>
        )}

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
              Your account is registered and verified. All 90%+ confidence AI predictions, value odds &amp; tactical simulations are now permanently unlocked.
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
        ) : currentStep === 1 ? (
          /* ── STEP 1: SIGN IN WITH GOOGLE ── */
          <div style={{
            background: 'rgba(18, 24, 20, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 12,
            padding: '1.25rem',
          }}>
            {isUserAuthenticated ? (
              /* Already authenticated info */
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', padding: '0.4rem', background: 'rgba(74, 222, 128, 0.15)', borderRadius: '50%', marginBottom: '0.5rem' }}>
                  <CheckCircle2 size={28} color="#4ade80" />
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#4ade80', margin: '0 0 0.35rem 0' }}>
                  Step 1 Completed!
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
                  Connected as <strong>{activeUser?.first_name || activeUser?.username || activeUser?.email || 'Member'}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="ref-btn-register pulse-glow"
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #d4a843, #e8c060)',
                    color: '#000',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span>Proceed to Step 2: Activate 1WIN</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              /* Unauthenticated Google prompt */
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem' }}>
                  <UserCheck size={18} color="#38bdf8" />
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
                    Step 1 of 2: Sign in with Google
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem 0', lineHeight: 1.45 }}>
                  Sign in in 1-click to auto-link your dedicated tracking ID, then activate your 500% bonus in Step 2.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                  <div ref={googleBtnRef} style={{ minHeight: 44, display: 'flex', justifyContent: 'center' }} />
                </div>

                <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Skip to Step 2 (Direct Partner Activation) ➔
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── STEP 2: ACTIVATE 1WIN PARTNER ── */
          <div>
            <div style={{
              background: 'rgba(15, 30, 20, 0.9)',
              border: '1px solid rgba(212, 168, 67, 0.35)',
              borderRadius: 12,
              padding: '1.15rem',
            }}>
              {/* Step 1 summary pill */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 8,
                padding: '0.4rem 0.65rem',
                marginBottom: '0.9rem',
                fontSize: '0.76rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={14} color="#4ade80" />
                  <span style={{ color: '#4ade80', fontWeight: 700 }}>Step 1:</span>
                  <span style={{ color: '#e4e4e7' }}>{activeUser?.first_name || activeUser?.email || (isTgEnvironment ? 'Telegram Connected' : 'Ready')}</span>
                </div>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>➔ Step 2: Final Step</span>
              </div>

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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.82rem', color: '#e4e4e7', marginBottom: '1.15rem' }}>
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

              {/* Step 2 Action Button */}
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
                <span>Step 2: Register on 1WIN &amp; Unlock</span>
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
          </div>
        )}
      </div>
    </div>
  );
};
