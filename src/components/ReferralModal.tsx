import React from 'react';
import { ExternalLink, CheckCircle2, ShieldAlert, Download } from 'lucide-react';
import type { ReferralSite } from '../types';

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

  const isTgEnvironment = Boolean(telegramId || window.Telegram?.WebApp?.initData);

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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="glass"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '1.4rem',
          background: '#121a2c',
          border: '1px solid var(--accent-cyan)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.9rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <ShieldAlert color="var(--accent-amber)" size={20} /> VIP Access & Unlock
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '1.2rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
            marginBottom: '0.8rem',
          }}
        >
          Register on one of our verified partner bookmakers below. Your Tracking ID (
          <code>{effectiveId}</code>) is automatically linked for instant auto-verification!
        </p>

        {/* Secure Telegram Linkage Section for Web Users */}
        {!isTgEnvironment && (
          <div
            style={{
              marginBottom: '0.9rem',
              background: 'rgba(15,23,42,0.6)',
              padding: '0.75rem',
              borderRadius: 8,
              border: '1px solid var(--border)',
            }}
          >
            {telegramId ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--accent-green)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                <CheckCircle2 size={16} /> Verified Telegram Linked: ID {telegramId}
              </div>
            ) : (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.74rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.3rem',
                    fontWeight: 600,
                  }}
                >
                  Link Telegram Account:
                </label>
                <p
                  style={{
                    fontSize: '0.7rem',
                    color: '#94a3b8',
                    marginBottom: '0.6rem',
                    lineHeight: 1.3,
                  }}
                >
                  Log in securely with Telegram to verify ownership and sync your VIP status.
                </p>

                {linkError && (
                  <div
                    style={{
                      color: '#ef4444',
                      fontSize: '0.72rem',
                      marginBottom: '0.5rem',
                      background: 'rgba(239,68,68,0.1)',
                      padding: '0.4rem',
                      borderRadius: 4,
                    }}
                  >
                    {linkError}
                  </div>
                )}

                {linking && (
                  <div
                    style={{
                      color: 'var(--accent-cyan)',
                      fontSize: '0.72rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Verifying Telegram authentication...
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    alignItems: 'center',
                  }}
                >
                  <div
                    ref={widgetContainerRef}
                    style={{ minHeight: 38, display: 'flex', justifyContent: 'center' }}
                  />

                  <a
                    href={`https://t.me/${botUsername}/${webappShortName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--accent-cyan)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    Or open directly in Telegram Mini App →
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Partner Sites List */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.7rem',
            marginBottom: '1.2rem',
          }}
        >
          {sites.length > 0 ? (
            sites.map((site) => {
              const tid = effectiveId;

              // Build tracking URLs
              const backendBase = 'https://telegram-backend-2yck.onrender.com';
              const trackingUrl =
                tid && tid !== 'anonymous' ? `${backendBase}/go/${site.id}/${tid}` : site.base_url;

              let appTrackingUrl = site.app_url || '';
              if (appTrackingUrl && tid && tid !== 'anonymous') {
                const sep = appTrackingUrl.includes('?') ? '&' : '?';
                appTrackingUrl = `${appTrackingUrl}${sep}subid=${tid}&sub1=${tid}`;
              }

              const handleOpenWeb = (e: React.MouseEvent) => {
                e.preventDefault();
                if (window.Telegram?.WebApp?.openLink) {
                  window.Telegram.WebApp.openLink(trackingUrl);
                } else {
                  window.open(trackingUrl, '_blank', 'noopener,noreferrer');
                }
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
                <div
                  key={site.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    background: 'rgba(15,23,42,0.6)',
                    padding: '0.8rem',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'white' }}>
                      {site.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        color: 'var(--accent-green)',
                        fontWeight: 700,
                        background: 'rgba(34, 197, 94, 0.15)',
                        padding: '0.1rem 0.4rem',
                        borderRadius: 4,
                      }}
                    >
                      Verified Partner
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 4 }}>
                    <button
                      onClick={handleOpenWeb}
                      className="btn-primary"
                      style={{ flex: 1, fontSize: '0.78rem', padding: '0.55rem' }}
                    >
                      <ExternalLink size={13} /> Register Website
                    </button>
                    {appTrackingUrl && (
                      <button
                        onClick={handleOpenApp}
                        style={{
                          flex: 1,
                          fontSize: '0.78rem',
                          padding: '0.55rem',
                          background: 'rgba(56, 189, 248, 0.15)',
                          border: '1px solid var(--accent-cyan)',
                          color: 'var(--accent-cyan)',
                          borderRadius: 10,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem',
                          fontWeight: 700,
                        }}
                      >
                        <Download size={13} /> Android App
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '1.5rem',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
              }}
            >
              No active referral partners available at the moment.
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--accent-cyan)',
            background: 'rgba(56, 189, 248, 0.08)',
            padding: '0.6rem 0.8rem',
            borderRadius: 8,
          }}
        >
          <CheckCircle2 size={16} /> Instant VIP unlock after registration
        </div>
      </div>
    </div>
  );
};
