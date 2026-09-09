export interface ContentLayerFlags {
  guest_can_see_summary: boolean;
  guest_can_see_stats: boolean;
  guest_can_see_ai_full: boolean;
  guest_can_see_watch_live: boolean;
  payment_gateway_enabled: boolean;
  unlock_via_referral: boolean;
}

export const DEFAULT_CONTENT_LAYERS: ContentLayerFlags = {
  guest_can_see_summary: true,
  guest_can_see_stats: false,
  guest_can_see_ai_full: false,
  guest_can_see_watch_live: true,
  payment_gateway_enabled: false,
  unlock_via_referral: true,
};

export interface Prediction {
  id: number;
  fixture_id?: number;
  match_title: string;
  tournament_name?: string;
  surface?: string;
  round_name?: string;
  home_name: string;
  away_name: string;
  home_id?: number;
  away_id?: number;
  home_image?: string;
  away_image?: string;
  home_country?: string;
  away_country?: string;
  home_odds?: string | number;
  away_odds?: string | number;
  predicted_winner: string;
  predicted_score?: string;
  win_probability?: number;
  confidence?: string;
  key_factors?: string[];
  devils_advocate_risk?: string;
  best_bet_market?: string;
  best_bet_selection?: string;
  best_bet_rationale?: string;
  best_bet_ev?: string;
  alt_bet_market?: string;
  alt_bet_selection?: string;
  alt_bet_rationale?: string;
  alt_bet_risk?: string;
  ai_summary?: string;
  status: 'UPCOMING' | 'LIVE' | 'WON' | 'LOST' | 'VOID' | 'INTERRUPTED' | 'POSTPONED';
  result_score?: string;
  match_date?: string;
  published_at: string;
  content_locked?: boolean;
  content_layers?: ContentLayerFlags;
}

export interface StatsOverviewData {
  totalPredictions: number;
  settled: number;
  won: number;
  lost: number;
  upcoming: number;
  winRatePct: number;
}

export interface ReferralSite {
  id: number;
  name: string;
  base_url: string;
  referral_url?: string;
  app_url?: string;
  verify_mode?: string;
}

export interface DeepAnalyticsTeaser {
  locked?: boolean;
  matchInfo?: {
    player1: string;
    player2: string;
    surface: string;
    asOfCutoff: string;
    dataCompletenessPct: number;
  };
  teaser?: any;
  p1RollingForm?: any;
  p2RollingForm?: any;
  h2hSummary?: any;
  p1SurfaceMastery?: any;
  p2SurfaceMastery?: any;
  p1Workload?: any;
  p2Workload?: any;
  explanationCards?: { title: string; body: string; severity?: string }[];
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        openLink?: (url: string) => void;
        openTelegramLink?: (url: string) => void;
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        initData?: string;
        initDataUnsafe?: {
          user?: {
            id?: number;
            first_name?: string;
            username?: string;
          };
        };
      };
    };
  }
}
