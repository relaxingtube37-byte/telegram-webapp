import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { CheckCircle2, Sparkles, X, Gift, ArrowRight, UserCheck, ShieldCheck, RefreshCw, ExternalLink, Clock } from 'lucide-react';
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
  onAccountConnected?: (newToken?: string, user?: any) => void;
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
  onAccountConnected,
}) => {
  const isLoggedOut = typeof window !== 'undefined' && localStorage.getItem('ptin_user_logged_out') === 'true';
  const hasTelegramInitData = typeof window !== 'undefined' && Boolean(window.Telegram?.WebApp?.initData);
  const isTgEnvironment = !isLoggedOut && Boolean(
    telegramId ||
    hasTelegramInitData ||
    (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.id)
  );

  const [justConnectedUser, setJustConnectedUser] = useState<any | null>(null);
  const activeUser = currentUser || justConnectedUser;

  const isUserAuthenticated = Boolean(
    isTgEnvironment ||
    telegramId ||
    activeUser?.email ||
    activeUser?.username
  );

  const [isReconnectingTg, setIsReconnectingTg] = useState(false);

  const handleTelegramReconnect = async () => {
    try {
      setIsReconnectingTg(true);
      localStorage.removeItem('ptin_user_logged_out');
      const rawInitData = window.Telegram?.WebApp?.initData;
      if (rawInitData) {
        const res = await fetch(`${apiBase}/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            initData: rawInitData,
            start_param: (window.Telegram?.WebApp as any)?.initDataUnsafe?.start_param || undefined,
          }),
        }).then(r => r.json());
        if (res?.success && res.user) {
          const isAlreadyVerified = Boolean(
            res.verified === true ||
            res.user?.is_verified === 1 ||
            res.user?.verify_status === 'verified'
          );

          localStorage.setItem('ptin_telegram_user', JSON.stringify(res.user));
          if (res.sessionToken) localStorage.setItem('ptin_web_session', res.sessionToken);
          setJustConnectedUser(res.user);

          if (isAlreadyVerified) {
            try {
              localStorage.setItem('ptin_web_verified', 'true');
              localStorage.setItem('ptin_partner_activated', 'true');
            } catch {}
            if (onVerified) onVerified(res.sessionToken, res.user);
            setIsCompleted(true);
            onClose();
            return;
          }

          // First-time or unverified Telegram user: Step 1 done -> advance to mandatory Step 2
          try {
            localStorage.removeItem('ptin_web_verified');
            localStorage.removeItem('ptin_partner_activated');
          } catch {}
          if (onAccountConnected) {
            onAccountConnected(res.sessionToken, res.user);
          }
          setCurrentStep(2);
        }
      }
    } catch (err) {
      console.warn('[Telegram Reconnect Error]:', err);
    } finally {
      setIsReconnectingTg(false);
    }
  };

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
        localStorage.removeItem('ptin_user_logged_out');
      } catch {}
      setJustConnectedUser(user);

      // Returning member who already completed 2-step registration previously: direct 1-step login!
      const isAlreadyVerified = Boolean(
        user?.verified === true ||
        user?.is_verified === 1 ||
        user?.verify_status === 'verified'
      );

      if (isAlreadyVerified) {
        try {
          localStorage.setItem('ptin_web_verified', 'true');
          localStorage.setItem('ptin_partner_activated', 'true');
        } catch {}
        if (onVerified) {
          onVerified(newToken, user);
        }
        setIsCompleted(true);
        onClose();
        return;
      }

      // First-time or unverified user: Step 1 done -> advance to mandatory Step 2
      if (onAccountConnected) {
        onAccountConnected(newToken, user);
      }
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

  const [isAwaitingPostback, setIsAwaitingPostback] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const checkPostbackStatus = useCallback(async (manual = false) => {
    if (manual) setIsCheckingStatus(true);
    try {
      const storedToken = sessionToken || (typeof window !== 'undefined' ? localStorage.getItem('ptin_web_session') : null);
      const rawInitData = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initData : undefined;

      const queryParams = new URLSearchParams();
      if (effectiveId && effectiveId !== 'anonymous') queryParams.set('telegramId', String(effectiveId));
      if (activeUser?.email) queryParams.set('email', activeUser.email);
      if (storedToken) queryParams.set('sessionToken', storedToken);
      if (rawInitData) queryParams.set('initData', rawInitData);

      const headers: Record<string, string> = {
        Accept: 'application/json',
      };
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;
      if (rawInitData) headers['x-telegram-init-data'] = rawInitData;
      if (effectiveId && effectiveId !== 'anonymous') headers['x-telegram-id'] = String(effectiveId);

      const res = await fetch(`${apiBase}/auth/status?${queryParams.toString()}`, {
        headers,
      }).then(r => r.json());

      if (res?.verified === true || res?.user?.is_verified === 1 || res?.verify_status === 'verified') {
        try {
          localStorage.removeItem('ptin_user_logged_out');
          localStorage.setItem('ptin_web_verified', 'true');
          localStorage.setItem('ptin_partner_activated', 'true');
        } catch {}
        setIsAwaitingPostback(false);
        setIsCompleted(true);
        if (onVerified) {
          onVerified(storedToken || undefined, activeUser);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[Postback Status Check Error]:', err);
      return false;
    } finally {
      if (manual) setIsCheckingStatus(false);
    }
  }, [apiBase, sessionToken, effectiveId, activeUser, onVerified]);

  useEffect(() => {
    if (!isAwaitingPostback || isCompleted) return;

    // Check status periodically (every 3.5s)
    const interval = setInterval(() => {
      checkPostbackStatus(false);
    }, 3500);

    const handleFocus = () => {
      checkPostbackStatus(false);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [isAwaitingPostback, isCompleted, checkPostbackStatus]);

  const handleRegisterAndStartWait = (e: React.MouseEvent) => {
    e.preventDefault();
    if (trackingUrl) {
      openExternalLink(trackingUrl);
    }
    setIsAwaitingPostback(true);

    // Notify backend that registration was initiated (records pending site in DB)
    fetch(`${apiBase}/referral/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telegramId: effectiveId !== 'anonymous' ? effectiveId : undefined,
        siteId: primarySite?.id || 1,
        sessionToken: sessionToken || (typeof window !== 'undefined' ? localStorage.getItem('ptin_web_session') : null),
        googleId: activeUser?.google_id || undefined,
        email: activeUser?.email || undefined,
      }),
    }).catch(() => {});
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
              Your account is registered and verified. All AI match predictions, value odds &amp; tactical simulations are now permanently unlocked.
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                  {activeUser?.avatar_url ? (
                    <img
                      src={activeUser.avatar_url}
                      alt="User avatar"
                      style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #4ade80', objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{ display: 'inline-flex', padding: '0.4rem', background: 'rgba(74, 222, 128, 0.15)', borderRadius: '50%' }}>
                      <CheckCircle2 size={28} color="#4ade80" />
                    </div>
                  )}
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
              /* Unauthenticated prompt */
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem' }}>
                  <UserCheck size={18} color="#38bdf8" />
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
                    Step 1 of 2: Sign in
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1.15rem 0', lineHeight: 1.45 }}>
                  Sign in in 1-click to auto-link your dedicated tracking ID, then activate your 500% bonus in Step 2.
                </p>

                {hasTelegramInitData && (
                  <div style={{ marginBottom: '1rem' }}>
                    <button
                      type="button"
                      onClick={handleTelegramReconnect}
                      disabled={isReconnectingTg}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: 10,
                        border: 'none',
                        background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        cursor: isReconnectingTg ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                      }}
                    >
                      <Sparkles size={16} />
                      <span>{isReconnectingTg ? 'Connecting Telegram...' : 'Connect Telegram Account (1-Click)'}</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0.85rem 0', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>
                      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                      <span>OR CONTINUE WITH GOOGLE</span>
                      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                  <div ref={googleBtnRef} style={{ minHeight: 44, display: 'flex', justifyContent: 'center' }} />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── STEP 2: ACTIVATE 1WIN PARTNER ── */
          <div>
            {isAwaitingPostback ? (
              /* Awaiting 1WIN Postback Confirmation State */
              <div style={{
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                borderRadius: 12,
                padding: '1.25rem',
                textAlign: 'center',
              }}>
                {/* Animated Pulsing Radar Icon */}
                <div style={{
                  position: 'relative',
                  width: 56,
                  height: 56,
                  margin: '0 auto 1rem auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: 'rgba(251, 191, 36, 0.2)',
                    animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                  }} />
                  <div style={{
                    position: 'relative',
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(212, 168, 67, 0.15))',
                    border: '1px solid #fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <RefreshCw size={22} color="#fbbf24" style={{ animation: 'spin 3s linear infinite' }} />
                  </div>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: 20,
                  background: 'rgba(251, 191, 36, 0.15)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  marginBottom: '0.6rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#fbbf24',
                }}>
                  <Clock size={12} />
                  <span>AWAITING 1WIN CONFIRMATION</span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: '0 0 0.4rem 0' }}>
                  Awaiting 1WIN Registration Confirmation...
                </h3>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                  The 1WIN registration page has opened in a new window. Complete your registration there. Once 1WIN sends the confirmation postback, your full Pro AI predictions will unlock automatically.
                </p>

                {/* Check Status Now button */}
                <button
                  type="button"
                  onClick={() => checkPostbackStatus(true)}
                  disabled={isCheckingStatus}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    background: 'linear-gradient(135deg, #fbbf24, #d4a843)',
                    color: '#09090b',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: isCheckingStatus ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    boxShadow: '0 4px 14px rgba(251, 191, 36, 0.25)',
                  }}
                >
                  <RefreshCw size={15} style={{ animation: isCheckingStatus ? 'spin 1s linear infinite' : 'none' }} />
                  <span>{isCheckingStatus ? 'Checking Status...' : 'Check Status Now'}</span>
                </button>

                {/* Reopen 1WIN Link if popup was closed/blocked */}
                {trackingUrl && (
                  <button
                    type="button"
                    onClick={() => openExternalLink(trackingUrl)}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: 8,
                      padding: '0.5rem 0.8rem',
                      color: '#93c5fd',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <ExternalLink size={13} />
                    <span>Reopen 1WIN Registration Page</span>
                  </button>
                )}
              </div>
            ) : (
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
                    <span>Instant access to <strong>AI match predictions</strong> &amp; tactical dossiers</span>
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
                  onClick={handleRegisterAndStartWait}
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
