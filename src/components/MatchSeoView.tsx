/**
 * Thin compatibility wrapper — Phase B match UI lives in MatchAnalysisPage.
 * Phase C business CTAs pass through when provided.
 */
import React from 'react';
import type { ContentLayerFlags, Prediction, ReferralSite } from '../types';
import type { BusinessActionsPublic } from '../utils/referralLinks';
import { MatchAnalysisPage } from './match/MatchAnalysisPage';

interface MatchSeoViewProps {
  prediction: Prediction;
  selectedTimezone: string;
  isVerified?: boolean;
  accessMode?: string;
  contentLayers?: ContentLayerFlags;
  apiBase: string;
  sessionToken?: string | null;
  referralSites?: ReferralSite[];
  trackingId?: string | number;
  businessActions?: BusinessActionsPublic;
  onBack: () => void;
  onUnlockClick?: () => void;
}

export const MatchSeoView: React.FC<MatchSeoViewProps> = ({
  prediction,
  selectedTimezone,
  isVerified,
  accessMode,
  apiBase,
  sessionToken,
  referralSites,
  trackingId,
  businessActions,
  onBack,
  onUnlockClick,
}) => (
  <MatchAnalysisPage
    prediction={prediction}
    selectedTimezone={selectedTimezone}
    webappApiBase={apiBase}
    sessionToken={sessionToken}
    isVerified={isVerified}
    accessMode={accessMode}
    referralSites={referralSites}
    trackingId={trackingId}
    businessActions={businessActions}
    onBack={onBack}
    onUnlockClick={onUnlockClick}
  />
);
