export type AppRole = 'admin' | 'investor' | 'startup';
export type StartupSector = 
  | 'technology'
  | 'healthcare'
  | 'fintech'
  | 'edtech'
  | 'ecommerce'
  | 'green_energy'
  | 'real_estate'
  | 'consumer'
  | 'manufacturing'
  | 'agriculture'
  | 'logistics'
  | 'media_entertainment';

export type FundingStage = 'pre_seed' | 'seed' | 'series_a' | 'series_b' | 'series_c';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Startup {
  id: string;
  founder_id: string;
  name: string;
  tagline: string;
  description: string;
  sector: StartupSector;
  funding_stage: FundingStage;
  funding_goal: number;
  amount_raised: number;
  min_investment: number;
  logo_url: string | null;
  pitch_video_url: string | null;
  pitch_deck_url: string | null;
  website_url: string | null;
  founded_year: number | null;
  team_size: number | null;
  location: string | null;
  valuation: number | null;
  total_shares: number | null;
  verification_status: VerificationStatus;
  verified_at: string | null;
  verified_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  founder?: Profile;
}

export interface Investment {
  id: string;
  investor_id: string;
  startup_id: string;
  amount: number;
  status: string;
  created_at: string;
  startup?: Startup;
  investor?: Profile;
}

export interface Watchlist {
  id: string;
  user_id: string;
  startup_id: string;
  created_at: string;
  startup?: Startup;
}

export const SECTOR_LABELS: Record<StartupSector, string> = {
  technology: 'Technology',
  healthcare: 'Healthcare',
  fintech: 'FinTech',
  edtech: 'EdTech',
  ecommerce: 'E-Commerce',
  green_energy: 'Green Energy',
  real_estate: 'Real Estate',
  consumer: 'Consumer',
  manufacturing: 'Manufacturing',
  agriculture: 'Agriculture',
  logistics: 'Logistics',
  media_entertainment: 'Media & Entertainment',
};

export const FUNDING_STAGE_LABELS: Record<FundingStage, string> = {
  pre_seed: 'Pre-Seed',
  seed: 'Seed',
  series_a: 'Series A',
  series_b: 'Series B',
  series_c: 'Series C',
};

export const SECTOR_ICONS: Record<StartupSector, string> = {
  technology: '💻',
  healthcare: '🏥',
  fintech: '💰',
  edtech: '📚',
  ecommerce: '🛒',
  green_energy: '🌱',
  real_estate: '🏠',
  consumer: '🛍️',
  manufacturing: '🏭',
  agriculture: '🌾',
  logistics: '🚚',
  media_entertainment: '🎬',
};
