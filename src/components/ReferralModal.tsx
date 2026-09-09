import React from 'react';
import { ExternalLink, CheckCircle2, ShieldCheck, Download, Sparkles, X, Send } from 'lucide-react';
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
  onClose,
  onVerified,
}) => {
  const [linking, setLinking] = React.useState(false);
  const [linkError, setLinkError] = React.useState<string | null>(null);
  const widgetContainerRef = React.useRef<HTMLDivElement>(null);
  const googleBtnRef = React.useRef<HTMLDivElement>(null);

  const isTgEnvironment = Boolean(telegramId || window.Telegram?.WebApp?.initData);

  const { renderGoogleButton } = useGoogleAuth({
    apiBase,
    sessionToken,
    enabled: false,
    onSuccess: (newToken, user) => {
      setLinking(false);
      setLinkError(null);
      if (onVerified) {
        onVerified(newToken, user);
      }
    },
    onError: (err) => {
      setLinking(false);
      setLinkError(err);
    },
  });

  // Determine user tracking ID: verified Telegram ID takes precedence, then verified/session webId
  const effectiveId = React.useMemo(() => {
    if (telegramId && telegramId > 0) return telegramId;
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      return window.Telegram.WebApp.initDataUnsafe.user.id;
    }
    if (webId) return webId;
    return 'anonymous';
  }, [telegramId, webId]);

  const handleTelegramWidgetAuth = React.useCallback(
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
          if (onVerified) {
            onVerified(data.sessionToken, data.telegramUser);
          }
        } else {
          setLinkError(data.error || 'Failed to verify Telegram ownership');
        }
      } catch {
        setLinkError('Network error during Telegram verification');
      } finally {
        setLinking(false);
      }
    },
    [apiBase, sessionToken, onVerified]
  );

  React.useEffect(() => {
    if (isTgEnvironment || telegramId) return;

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
  }, [botUsername, isTgEnvironment, telegramId, handleTelegramWidgetAuth]);

  React.useEffect(() => {
    if (!isTgEnvironment && !telegramId && googleBtnRef.current) {
      renderGoogleButton(googleBtnRef.current);
    }
  }, [isTgEnvironment, telegramId, renderGoogleButton]);

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
      >
        {/* Top Header */}
        <div className="ref-modal-header">
          <div className="ref-modal-title-group">
            <div className="ref-modal-icon-badge">
              <Sparkles size={18} color="#38bdf8" />
            </div>
            <div>
              <h2 className="ref-modal-title">Member Access &amp; Full Dossier</h2>
              <p className="ref-modal-subtitle">Connect your account for complete AI predictive model insights</p>
            </div>
          </div>
          <button onClick={onClose} className="ref-modal-close-btn" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* 3-Step Visual Progress Guide */}
        <div className="ref-steps-container">
          <div className="ref-step-item">
            <div className="ref-step-num">1</div>
            <div className="ref-step-text">
              <strong>Connect Account</strong>
              <span>Google or Telegram 1-click</span>
            </div>
          </div>
          <div className="ref-step-arrow">→</div>
          <div className="ref-step-item">
            <div className="ref-step-num">2</div>
            <div className="ref-step-text">
              <strong>Auto Link</strong>
              <span>ID attached automatically</span>
            </div>
          </div>
          <div className="ref-step-arrow">→</div>
          <div className="ref-step-item">
            <div className="ref-step-num">3</div>
            <div className="ref-step-text">
              <strong>Full Access</strong>
              <span>Instant dossier unlocked</span>
            </div>
          </div>
        </div>

        {/* Tracking ID Badge */}
        <div className="ref-tracking-badge">
          <ShieldCheck size={14} color="#4ade80" />
          <span>Tracking ID: <code>{effectiveId}</code> (Auto-synced)</span>
        </div>

        {/* Secure Sign-in Section for Web Users */}
        {!isTgEnvironment && (
          <div className="ref-tg-link-box">
            {telegramId ? (
              <div className="ref-tg-linked">
                <CheckCircle2 size={16} color="#4ade80" />
                <span>Active Member Account Connected (ID: {telegramId})</span>
              </div>
            ) : (
              <div>
                <label className="ref-tg-label">
                  Connect Your Account:
                </label>
                <p className="ref-tg-desc">
                  Sign in with Google or Telegram to sync full match analyses across all your devices.
                </p>

                {linkError && (
                  <div className="ref-error-box">
                    {linkError}
                  </div>
                )}

                {linking && (
                  <div className="ref-status-text">
                    Verifying authentication...
                  </div>
                )}

                {/* Google One-Click Button */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0.8rem 0' }}>
                  <div ref={googleBtnRef} style={{ minHeight: 40, display: 'flex', justifyContent: 'center' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '0.6rem 0', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                  <span>or with Telegram</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                </div>

                <div className="ref-tg-widget-wrap">
                  <div
                    ref={widgetContainerRef}
                    style={{ minHeight: 38, display: 'flex', justifyContent: 'center' }}
                  />

                  <a
                    href={`https://t.me/${botUsername}/${webappShortName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ref-tg-miniapp-link"
                  >
                    <Send size={12} /> Or open directly in Telegram Mini App →
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Partner Sites List */}
        <div className="ref-partners-list">
          {sites.length > 0 ? (
            sites.map((site) => {
              const tid = effectiveId;
              const trackingUrl = buildPartnerRegisterUrl({
                apiBase,
                sites: [site],
                trackingId: tid || 'anonymous',
                page: 'referral_modal',
              });

              let appTrackingUrl = site.app_url || '';
              if (appTrackingUrl && tid && tid !== 'anonymous') {
                const sep = appTrackingUrl.includes('?') ? '&' : '?';
                appTrackingUrl = `${appTrackingUrl}${sep}subid=${tid}&sub1=${tid}`;
              }

              const handleOpenWeb = (e: React.MouseEvent) => {
                e.preventDefault();
                if (!trackingUrl) return;
                openExternalLink(trackingUrl);
              };

              const handleOpenApp = (e: React.MouseEvent) => {
                e.preventDefault();
                if (window.Telegram?.WebApp?.openLink) {
                  window.Telegram.WebApp.openLink(appTrackingUrl);
                } else {
                  window.open(appTrackingUrl, '_blank', 'noopener,noreferrer');
                }
              };

              return (
                <div key={site.id} className="ref-partner-card">
                  <div className="ref-partner-top">
                    <div>
                      <span className="ref-partner-title">
                        {site.name.toUpperCase()}
                      </span>
                      <span className="ref-verified-pill">
                        ✓ Verified Partner
                      </span>
                    </div>
                    <div className="ref-bonus-tag">
                      🎁 500% Welcome Bonus
                    </div>
                  </div>

                  <p className="ref-partner-perks">
                    Register with zero fees to unlock complete AI predictions, real-time value odds &amp; game models.
                  </p>

                  <div className="ref-partner-actions">
                    <button
                      onClick={handleOpenWeb}
                      className="ref-btn-register pulse-glow"
                    >
                      <ExternalLink size={14} /> Register with {site.name} (Free)
                    </button>
                    {appTrackingUrl && (
                      <button
                        onClick={handleOpenApp}
                        className="ref-btn-app"
                      >
                        <Download size={14} /> App Download
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="ref-empty-state">
              No active referral partners available at the moment.
            </div>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="ref-modal-footer">
          <CheckCircle2 size={15} color="#4ade80" />
          <span>Instant auto-verification • No credit card required • 100% Free</span>
        </div>
      </div>
    </div>
  );
};
