import React from 'react';
import type { Prediction, ReferralSite } from '../../types';
import {
  buildGoReferralUrl,
  openExternalLink,
  shouldShowWatchLive,
  type BusinessActionsPublic,
} from '../../utils/referralLinks';

interface MatchBusinessActionsProps {
  match: Prediction;
  sites: ReferralSite[];
  apiBase: string;
  trackingId: string | number;
  isVerified: boolean;
  businessActions: BusinessActionsPublic;
  onRegisterInfoClick?: () => void;
  onVerified?: () => void;
}

export const MatchBusinessActions: React.FC<MatchBusinessActionsProps> = ({
  match,
  sites,
  apiBase,
  trackingId,
  isVerified,
  businessActions,
  onRegisterInfoClick,
  onVerified,
}) => {
  const primary = sites[0];
  const showRegister =
    businessActions.registration_referral_enabled !== false && !isVerified && !!primary;
  const showWatch =
    businessActions.watch_live_enabled !== false &&
    !!primary &&
    shouldShowWatchLive(match.status, match.match_date);

  if (!showRegister && !showWatch) return null;

  const go = (action: 'registration' | 'watch_live') => {
    if (!primary) return;
    if (action === 'registration') {
      try {
        localStorage.setItem('ptin_web_verified', 'true');
        localStorage.setItem('ptin_partner_activated', 'true');
      } catch {}
      if (onVerified) onVerified();
    }
    const url = buildGoReferralUrl(apiBase, primary.id, trackingId, {
      action,
      matchId: match.id,
      fixtureId: match.fixture_id,
      page: 'match',
    });
    if (url) openExternalLink(url);
    else onRegisterInfoClick?.();
  };

  return (
    <section
      className="glass"
      style={{
        padding: '1rem 1.1rem',
        borderRadius: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div style={{ fontSize: '0.72rem', letterSpacing: '0.06em', color: 'var(--text-secondary)', fontWeight: 700 }}>
        MATCH ACTIONS
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
        {showWatch && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => go('watch_live')}
            style={{ padding: '0.55rem 1.1rem', fontWeight: 700 }}
          >
            Watch live
          </button>
        )}
        {showRegister && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => go('registration')}
            style={{
              padding: '0.55rem 1.1rem',
              fontWeight: 700,
              opacity: isVerified ? 0.45 : 1,
            }}
          >
            Register for full analysis
          </button>
        )}
        {showRegister && onRegisterInfoClick && (
          <button
            type="button"
            onClick={onRegisterInfoClick}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#93c5fd',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            How membership works
          </button>
        )}
      </div>
      {businessActions.payment_mode_placeholder_enabled && (
        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          Payment unlock is prepared for a later release — not active yet.
        </p>
      )}
      <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
        Opens partner page via secure redirect. No stream is played on this site.
      </p>
    </section>
  );
};
