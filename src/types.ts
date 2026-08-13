export interface Prediction {
  id: number;
  fixture_id?: number;
  match_title: string;
  tournament_name?: string;
  surface?: string;
  round_name?: string;
  home_name: string;
  away_name: string;
  home_odds?: string;
  away_odds?: string;
  predicted_winner: string;
  predicted_score?: string;
  win_probability?: number;
  confidence?: string;
  key_factors?: string[];
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
