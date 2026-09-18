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
  gender?: 'men' | 'women';
  tour_category?: string;
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

export type TourType = 'ATP' | 'WTA';
export type SkillCategory = 'SERVE' | 'RETURN' | 'COMPOSITE';

export interface IMetricNode {
  key: string;               // e.g. 'hold_rate', 'first_serve_pts_won'
  label: string;             // e.g. 'Serve Games (Hold %)'
  category: SkillCategory;
  raw_value: number;         // e.g. 0.810 (percentage as fraction or actual unit)
  display_string: string;    // e.g. '81.0%'
  rating_score: number;      // 40-100 normalized integer (e.g. 98)
  tour_delta_raw: number;    // e.g. +0.090 vs tour average
  tour_delta_string: string; // e.g. '+9.0%'
}

export interface ICompositeRatings {
  dominance_ratio: IMetricNode;
  match_efficiency: IMetricNode;
  serve_composite: number;   // Aggregated 0-100 serve score
  return_composite: number;  // Aggregated 0-100 return score
  overall_rating: number;    // Master 0-100 rating
}

export interface IPlayerReadiness {
  energyScore: number;       // 0-100%
  statusLabel: string;       // 'PEAK_READINESS' | 'OPTIMAL' | 'MODERATE_LOAD' | 'HIGH_FATIGUE'
  restDays: number;
  restLabel: string;
  matches7d?: number;
}

export interface IPlayerMentalGrit {
  clutchScore: number;       // 0-100
  verdict: string;           // 'ELITE_CLUTCH' | 'RESOLUTE' | 'STEADY' | 'VULNERABLE'
  frontRunnerWinPct: string; // e.g. '88.5%'
  comebackRatePct: string;   // e.g. '34.2%'
}

export interface PlayerSkillsDecagon {
  serveGames?: number;
  firstServePts?: number;
  firstServeAcc?: number;
  secondServePts?: number;
  bpsSaved?: number;
  tbsWon?: number;
  returnGames?: number;
  returnFirstPts?: number;
  returnSecondPts?: number;
  returnBpsWon?: number;
  [key: string]: number | undefined;
}

export interface IPlayerTelemetryCard {
  player_id: string;
  full_name: string;
  tour: TourType;
  snapshot_date: string;
  lookback_days: number;     // 365
  radar_axes: IMetricNode[]; // Exactly 10 nodes for the Decagon
  composites: ICompositeRatings;
  readiness?: IPlayerReadiness;
  mental?: IPlayerMentalGrit;

  // Legacy compatibility
  name?: string;
  rank?: number | null;
  countryCode?: string | null;
  radar?: PlayerSkillsDecagon | Record<string, number>;
  skills?: any;
}

export interface IModernTelemetryHub {
  biomechanics: {
    p1_energy_tank_pct: number;
    p2_energy_tank_pct: number;
    p1_acwr: number;
    p2_acwr: number;
    p1_status: string;
    p2_status: string;
    p1_rest_label: string;
    p2_rest_label: string;
    p1_matches_7d: number;
    p2_matches_7d: number;
  };
  mental_clutch: {
    p1_clutch_score: number;
    p2_clutch_score: number;
    p1_clutch_rating10: number;
    p2_clutch_rating10: number;
    p1_verdict: string;
    p2_verdict: string;
    p1_comeback_pct: number;
    p2_comeback_pct: number;
    p1_front_runner_pct: number;
    p2_front_runner_pct: number;
    tension_delta: number;
  };
  court_dynamics: {
    cpi: number;
    cpi_label: string;
    surface: string;
    p1_surface_elo: number;
    p2_surface_elo: number;
    elo_delta: number;
    favored_player_index: number;
  };
  synergy_clash: {
    p1_tsi: number;
    p2_tsi: number;
    p1_dr: number;
    p2_dr: number;
    p1_hold: number;
    p2_hold: number;
    p1_break: number;
    p2_break: number;
    p1_tier: string;
    p2_tier: string;
  };
}

export interface IPlayerComparison {
  matchup_id: string;
  fixture_id?: number;
  tour: TourType;
  surface: string;
  court_speed_label?: string;
  generated_at: string;
  player_one: IPlayerTelemetryCard;
  player_two: IPlayerTelemetryCard;
  head_to_head_delta: Record<string, number>;
  modern_telemetry?: IModernTelemetryHub;

  // Legacy compatibility aliases
  version?: string;
  meta?: {
    fixtureId?: number;
    tour?: string;
    surface?: string;
    courtSpeedLabel?: string;
    generatedAt?: string;
  };
  player1?: IPlayerTelemetryCard;
  player2?: IPlayerTelemetryCard;
}

export type ProIntelligencePayload = IPlayerComparison;


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
