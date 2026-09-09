import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ExternalLink, CheckCircle2, ShieldCheck, Download, Sparkles, X, Send, Gift, ArrowRight, UserCheck, Lock } from 'lucide-react';
import type { ReferralSite } from '../types';
import { buildPartnerRegisterUrl, openExternalLink } from '../utils/referralLinks';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

declare global {
  interface Window {
    onTelegramAuth?: (user: any) => void;
  }
}

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
  botUsername = 'admdinbetbetforbot',
  webappShortName = 'app',
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
  const isUserAuthenticated = Boolean(
    isTgEnvironment ||
    telegramId ||
    currentUser?.email ||
    currentUser?.username
  );

  // Default step: if inside Telegram or already authenticated, immediately open step 2
  const [currentStep, setCurrentStep] = useState<1 | 2>(() => {
    if (initialStep) return initialStep;
    return (isTgEnvironment || isUserAuthenticated) ? 2 : 1;
  });

  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [justConnectedUser, setJustConnectedUser] = useState<any | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const { renderGoogleButton } = useGoogleAuth({
    apiBase,
    sessionToken,
    enabled: false,
    onSuccess: (newToken, user) => {
      setLinking(false);
      setLinkError(null);
      setJustConnectedUser(user);
      setCurrentStep(2); // Auto-advance to Step 2 (1WIN Partner Activation)
      if (onVerified) {
        onVerified(newToken, user);
      }
    },
    onError: (err) => {
      setLinking(false);
      setLinkError(err);
    },
  });

  // Effective tracking ID: verified user numeric ID, telegram ID, or session webId
  const effectiveId = useMemo(() => {
    if (telegramId && telegramId > 0) return telegramId;
    if (justConnectedUser?.telegram_id) return justConnectedUser.telegram_id;
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      return window.Telegram.WebApp.initDataUnsafe.user.id;
    }
    if (webId) return webId;
    return 'anonymous';
  }, [telegramId, justConnectedUser, webId]);

  const activeUser = currentUser || justConnectedUser;

  const handleTelegramWidgetAuth = useCallback(
    async (widgetUser: any) => {
      setLinking(true);
      setLinkError(null);
      try {
        const resp = await fetch(`${apiBase}/auth/telegram-widget`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authData: widgetUser,
            sessionToken: sessionToken || localStorage.getItem('ptin_web_session'),
          }),
        });
        const data = await resp.json();
        if (data.success) {
          setJustConnectedUser(data.telegramUser);
          setCurrentStep(2);
          if (onVerified) {
            onVerified(data.sessionToken, data.telegramUser);
          }
        } else {
          setLinkError(data.error || 'Failed to verify Telegram login');
        }
      } catch {
        setLinkError('Network error connecting to Telegram auth');
      } finally {
        setLinking(false);
      }
    },
    [apiBase, sessionToken, onVerified]
  );

  const completeActivation = useCallback(async (siteId?: number) => {
    try {
      localStorage.setItem('ptin_web_verified', 'true');
      localStorage.setItem('ptin_partner_activated', 'true');
    } catch {}
    if (onVerified) {
      onVerified(sessionToken || undefined, activeUser);
    }
    try {
      const resp = await fetch(`${apiBase}/referral/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: effectiveId !== 'anonymous' ? effectiveId : undefined,
          siteId,
          sessionToken: sessionToken || localStorage.getItem('ptin_web_session'),
        }),
      });
      const data = await resp.json();
      if (data?.sessionToken && onVerified) {
        onVerified(data.sessionToken, activeUser);
      }
    } catch {
      // Client is already unlocked client-side
    }
  }, [apiBase, effectiveId, sessionToken, activeUser, onVerified]);

  useEffect(() => {
    if (isTgEnvironment || isUserAuthenticated || currentStep !== 1) return;

    window.onTelegramAuth = (user: any) => {
      handleTelegramWidgetAuth(user);
    };

    const container = widgetContainerRef.current;
    if (container) {
      container.innerHTML = '';
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', botUsername);
      script.setAttribute('data-size', 'medium');
      script.setAttribute('data-radius', '8');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');
      script.async = true;
      container.appendChild(script);
    }

    return () => {
      delete window.onTelegramAuth;
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [botUsername, isTgEnvironment, isUserAuthenticated, currentStep, handleTelegramWidgetAuth]);

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
        style={{ maxWidth: 540 }}
      >
        {/* Top Header */}
        <div className="ref-modal-header">
          <div className="ref-modal-title-group">
            <div className="ref-modal-icon-badge">
              <Sparkles size={18} color="#d4a843" />
            </div>
            <div>
              <h2 className="ref-modal-title">Unlock Pro AI Predictions (2-Step Access)</h2>
              <p className="ref-modal-subtitle">Official Access &amp; Partner Activation</p>
            </div>
          </div>
          <button onClick={onClose} className="ref-modal-close-btn" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* 2-Step Interactive Stepper Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '0.6rem',
          margin: '0.5rem 0 1.25rem 0',
          padding: '0.6rem 0.85rem',
          background: 'rgba(0, 0, 0, 0.35)',
          borderRadius: 12,
          border: '1px solid rgba(212, 168, 67, 0.15)',
        }}>
          {/* Step 1 Pill */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.65rem',
              background: currentStep === 1
                ? 'rgba(56, 189, 248, 0.15)'
                : isUserAuthenticated
                ? 'rgba(74, 222, 128, 0.1)'
                : 'transparent',
              border: `1px solid ${currentStep === 1 ? '#38bdf8' : isUserAuthenticated ? '#4ade80' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 8,
              cursor: 'pointer',
              color: 'inherit',
              textAlign: 'left',
            }}
          >
            <div style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800,
              background: isUserAuthenticated ? '#4ade80' : currentStep === 1 ? '#38bdf8' : '#27272a',
              color: isUserAuthenticated || currentStep === 1 ? '#09090b' : '#a1a1aa',
            }}>
              {isUserAuthenticated ? '✓' : '1'}
            </div>
            <div style={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
              <div style={{ fontWeight: 700, color: currentStep === 1 ? '#38bdf8' : isUserAuthenticated ? '#4ade80' : '#d4d4d8' }}>
                Step 1: Connect Account
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                {isUserAuthenticated ? 'Connected ✓' : 'Google / Telegram'}
              </div>
            </div>
          </button>

          {/* Stepper Arrow */}
          <div style={{ color: 'rgba(212, 168, 67, 0.5)', fontWeight: 'bold' }}>➔</div>

          {/* Step 2 Pill */}
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.65rem',
              background: currentStep === 2
                ? 'rgba(212, 168, 67, 0.18)'
                : 'transparent',
              border: `1px solid ${currentStep === 2 ? '#fbbf24' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 8,
              cursor: 'pointer',
              color: 'inherit',
              textAlign: 'left',
            }}
          >
            <div style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800,
              background: currentStep === 2 ? '#fbbf24' : '#27272a',
              color: currentStep === 2 ? '#09090b' : '#a1a1aa',
            }}>
              2
            </div>
            <div style={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
              <div style={{ fontWeight: 700, color: currentStep === 2 ? '#fbbf24' : '#d4d4d8' }}>
                Step 2: Activate 1WIN
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                500% Bonus + Full Unlock
              </div>
            </div>
          </button>
        </div>

        {/* ── STEP 1 CONTENT: IDENTITY / SIGN IN ── */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isUserAuthenticated ? (
              <div style={{
                background: 'rgba(74, 222, 128, 0.08)',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                borderRadius: 12,
                padding: '1.25rem',
                textAlign: 'center',
              }}>
                <div style={{ display: 'inline-flex', padding: '0.5rem', background: 'rgba(74, 222, 128, 0.15)', borderRadius: '50%', marginBottom: '0.5rem' }}>
                  <CheckCircle2 size={32} color="#4ade80" />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#4ade80', margin: '0 0 0.4rem 0' }}>
                  Step 1 Completed Successfully!
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Account connected as <strong>{activeUser?.first_name || activeUser?.username || 'Member'}</strong> ({activeUser?.email || `ID: ${effectiveId}`}).
                </p>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 20,
                  fontSize: '0.75rem',
                  color: '#fbbf24',
                  marginTop: '0.85rem',
                }}>
                  <ShieldCheck size={14} color="#4ade80" />
                  <span>Your Dedicated Tracking ID: <code>{effectiveId}</code> (Auto-synced)</span>
                </div>

                <div style={{ marginTop: '1.2rem' }}>
                  <button
                    onClick={() => setCurrentStep(2)}
                    style={{
                      width: '100%',
                      padding: '0.8rem 1.2rem',
                      background: 'linear-gradient(135deg, #d4a843, #e8c060)',
                      color: '#000',
                      border: 'none',
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>Proceed to Step 2: Activate 1WIN (+500% Bonus)</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                background: 'rgba(18, 24, 20, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                padding: '1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <UserCheck size={18} color="#38bdf8" />
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
                    Step 1 of 2: Sign in with Google or Telegram
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                  Sign in with 1-click to auto-link your dedicated tracking ID and save your predictive model insights across all devices:
                </p>

                {linkError && (
                  <div style={{
                    background: 'rgba(244, 63, 94, 0.12)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    color: '#fb7185',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 8,
                    fontSize: '0.8rem',
                    marginBottom: '0.8rem',
                    textAlign: 'center',
                  }}>
                    {linkError}
                  </div>
                )}

                {linking && (
                  <div style={{ textAlign: 'center', color: '#38bdf8', fontSize: '0.82rem', marginBottom: '0.8rem' }}>
                    Connecting and verifying Google account...
                  </div>
                )}

                {/* Google 1-Click Button Container */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0.5rem 0' }}>
                  <div ref={googleBtnRef} style={{ minHeight: 44, display: 'flex', justifyContent: 'center' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '0.85rem 0', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                  <span>or sign in with Telegram</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
                  <div ref={widgetContainerRef} style={{ minHeight: 38, display: 'flex', justifyContent: 'center' }} />

                  <a
                    href={`https://t.me/${botUsername}/${webappShortName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#38bdf8',
                      fontSize: '0.78rem',
                      textDecoration: 'none',
                      marginTop: 4,
                    }}
                  >
                    <Send size={12} /> Open directly in Telegram Mini App →
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2 CONTENT: 1WIN PARTNER ACTIVATION ── */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Step 1 Completion Summary Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: isUserAuthenticated ? 'rgba(74, 222, 128, 0.08)' : 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${isUserAuthenticated ? 'rgba(74, 222, 128, 0.25)' : 'rgba(245, 158, 11, 0.3)'}`,
              borderRadius: 10,
              padding: '0.6rem 0.85rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                {isUserAuthenticated ? (
                  <>
                    <CheckCircle2 size={16} color="#4ade80" />
                    <span style={{ color: '#4ade80', fontWeight: 700 }}>Step 1 Connected:</span>
                    <span style={{ color: '#fff' }}>{activeUser?.first_name || activeUser?.email || 'User Account'}</span>
                  </>
                ) : (
                  <>
                    <Lock size={15} color="#fbbf24" />
                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>Step 1 Pending:</span>
                    <span style={{ color: '#a1a1aa' }}>Sign in to connect tracking ID</span>
                  </>
                )}
              </div>

              {!isUserAuthenticated && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#38bdf8',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Sign in with Google ➔
                </button>
              )}
            </div>

            {/* Tracking ID Connection Badge */}
            <div className="ref-tracking-badge" style={{ margin: 0 }}>
              <ShieldCheck size={14} color="#4ade80" />
              <span>Dedicated Tracking ID: <code>{effectiveId}</code> (Linked to Partner)</span>
            </div>

            {/* Activation Complete Celebration Card */}
            {isCompleted ? (
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
                  🎉 Activation Complete!
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
                  Your account is registered and verified. All daily 90%+ confidence AI predictions, value odds &amp; tactical simulations are now unlocked!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    completeActivation();
                    onClose();
                  }}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.2rem',
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
                  <span>Start Viewing Predictions ➔</span>
                </button>
              </div>
            ) : (
              /* Partner Site 1WIN Card */
              <div className="ref-partners-list" style={{ margin: 0 }}>
                {sites.length > 0 ? (
                  sites.map((site) => {
                    const trackingUrl = buildPartnerRegisterUrl({
                      apiBase,
                      sites: [site],
                      trackingId: effectiveId || 'anonymous',
                      page: 'referral_modal_step2',
                    });

                    let appTrackingUrl = site.app_url || '';
                    if (appTrackingUrl && effectiveId && effectiveId !== 'anonymous') {
                      const sep = appTrackingUrl.includes('?') ? '&' : '?';
                      appTrackingUrl = `${appTrackingUrl}${sep}subid=${effectiveId}&sub1=${effectiveId}`;
                    }

                    const handleOpenWeb = (e: React.MouseEvent) => {
                      e.preventDefault();
                      if (!trackingUrl) return;
                      openExternalLink(trackingUrl);
                      completeActivation(site.id);
                      setIsCompleted(true);
                    };

                    const handleOpenApp = (e: React.MouseEvent) => {
                      e.preventDefault();
                      if (window.Telegram?.WebApp?.openLink) {
                        window.Telegram.WebApp.openLink(appTrackingUrl);
                      } else {
                        window.open(appTrackingUrl, '_blank', 'noopener,noreferrer');
                      }
                      completeActivation(site.id);
                      setIsCompleted(true);
                    };

                    return (
                      <div key={site.id} className="ref-partner-card" style={{ border: '1px solid rgba(212, 168, 67, 0.4)', background: 'rgba(15, 30, 20, 0.85)' }}>
                        <div className="ref-partner-top">
                          <div>
                            <span className="ref-partner-title" style={{ fontSize: '1.1rem', color: '#fbbf24' }}>
                              {site.name.toUpperCase()}
                            </span>
                            <span className="ref-verified-pill" style={{ marginLeft: 6 }}>
                              ✓ Official Partner
                            </span>
                          </div>
                          <div className="ref-bonus-tag" style={{ background: 'linear-gradient(135deg, #d4a843, #fbbf24)', color: '#09090b', fontWeight: 800 }}>
                            🎁 500% Welcome Bonus
                          </div>
                        </div>

                        <p className="ref-partner-perks" style={{ margin: '0.6rem 0 1rem 0', lineHeight: 1.5, fontSize: '0.84rem' }}>
                          Click the button below to register directly with our official bonus code on <strong>{site.name}</strong>. Once registered, your account will be automatically recognized and full access to 90%+ AI predictions, live match feeds, and tactical simulations will unlock permanently.
                        </p>

                        <div className="ref-partner-actions">
                          <button
                            onClick={handleOpenWeb}
                            className="ref-btn-register pulse-glow"
                            style={{
                              fontSize: '0.95rem',
                              padding: '0.85rem 1.2rem',
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              fontWeight: 800,
                            }}
                          >
                            <Gift size={16} /> Register on {site.name} &amp; Claim 500% Bonus
                          </button>
                          {appTrackingUrl && (
                            <button
                              onClick={handleOpenApp}
                              className="ref-btn-app"
                            >
                              <Download size={14} /> Download App
                            </button>
                          )}
                        </div>

                        {/* Direct Unlock Button */}
                        <button
                          type="button"
                          onClick={() => {
                            completeActivation(site.id);
                            setIsCompleted(true);
                          }}
                          style={{
                            width: '100%',
                            marginTop: '0.75rem',
                            padding: '0.75rem 1rem',
                            background: 'rgba(56, 189, 248, 0.12)',
                            border: '1px solid rgba(56, 189, 248, 0.35)',
                            borderRadius: 10,
                            color: '#38bdf8',
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          <CheckCircle2 size={16} color="#38bdf8" />
                          <span>Complete Registration &amp; Unlock Full Predictions ➔</span>
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="ref-empty-state">
                    No active referral partner configured at this moment.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer Guarantee */}
        <div className="ref-modal-footer">
          <CheckCircle2 size={15} color="#4ade80" />
          <span>Instant Auto-Verification • No Subscription Fees • 100% Free Access</span>
        </div>
      </div>
    </div>
  );
};
