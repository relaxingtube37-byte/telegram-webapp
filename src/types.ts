export interface Prediction {
  id: number;
  fixture_id?: number;
  match_title: string;
  tournament_name?: string;
  surface?: string;
  round_name?: string;
  home_name: string;
  away_name: string;
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
  status: 'UPCOMING' | 'LIVE' | 'WON' | 'LOST' | 'VOID' | 'INTERRUPTED';
  result_score?: string;
  match_date?: string;
  published_at: string;
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
  app_url?: string;
  verify_mode?: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        openLink?: (url: string) => void;
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
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
