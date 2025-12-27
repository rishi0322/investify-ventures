// Sample AI Recommendations for demo mode
export interface SampleRecommendation {
  startup_id: string;
  startup_name: string;
  match_score: number;
  reasoning: string;
  sector: string;
  min_investment: number;
  funding_stage: string;
  logo_emoji: string;
}

export const sampleAIRecommendations: SampleRecommendation[] = [
  {
    startup_id: 'ai-rec-1',
    startup_name: 'SolarGrid AI',
    match_score: 94,
    reasoning: 'Strong alignment with your interest in green energy and technology. Early-stage opportunity with experienced founding team from Tesla and Google.',
    sector: 'green_energy',
    min_investment: 5000,
    funding_stage: 'seed',
    logo_emoji: '☀️'
  },
  {
    startup_id: 'ai-rec-2',
    startup_name: 'HealthSync Pro',
    match_score: 89,
    reasoning: 'Matches your healthcare portfolio focus. Revolutionary AI diagnostic platform with FDA approval pending. 3x growth YoY.',
    sector: 'healthcare',
    min_investment: 10000,
    funding_stage: 'series_a',
    logo_emoji: '🏥'
  },
  {
    startup_id: 'ai-rec-3',
    startup_name: 'PayFlow India',
    match_score: 87,
    reasoning: 'Complements your fintech investments. UPI-based B2B payments with 500% user growth in 12 months.',
    sector: 'fintech',
    min_investment: 2500,
    funding_stage: 'seed',
    logo_emoji: '💳'
  },
  {
    startup_id: 'ai-rec-4',
    startup_name: 'EduVerse VR',
    match_score: 82,
    reasoning: 'Emerging edtech opportunity with metaverse integration. Strong IP portfolio and partnerships with top universities.',
    sector: 'edtech',
    min_investment: 7500,
    funding_stage: 'pre_seed',
    logo_emoji: '🎓'
  },
  {
    startup_id: 'ai-rec-5',
    startup_name: 'FreshKart Logistics',
    match_score: 78,
    reasoning: 'Diversification opportunity in cold-chain logistics. Government contracts secured, 45% margins.',
    sector: 'logistics',
    min_investment: 15000,
    funding_stage: 'series_a',
    logo_emoji: '🚚'
  },
  {
    startup_id: 'ai-rec-6',
    startup_name: 'AgriDrone Tech',
    match_score: 75,
    reasoning: 'Innovative agriculture tech with drone-based crop monitoring. Operating in 12 states with proven ROI for farmers.',
    sector: 'agriculture',
    min_investment: 3000,
    funding_stage: 'seed',
    logo_emoji: '🌾'
  },
  {
    startup_id: 'ai-rec-7',
    startup_name: 'StreamBox Media',
    match_score: 71,
    reasoning: 'Regional OTT platform targeting tier-2 cities. 2M subscribers, exclusive content deals with Bollywood studios.',
    sector: 'media_entertainment',
    min_investment: 5000,
    funding_stage: 'series_a',
    logo_emoji: '🎬'
  }
];
