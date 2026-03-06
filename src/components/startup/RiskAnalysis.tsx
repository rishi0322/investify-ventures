import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Startup, FUNDING_STAGE_LABELS } from '@/types/database';
import { AlertTriangle, Shield, TrendingUp, Clock, Users, DollarSign } from 'lucide-react';

interface RiskAnalysisProps {
  startup: Startup;
}

interface RiskFactor {
  label: string;
  score: number; // 0-100, higher = riskier
  icon: React.ReactNode;
  detail: string;
}

function getRiskLevel(score: number): { label: string; color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  if (score <= 30) return { label: 'Low', color: 'text-green-500', variant: 'default' };
  if (score <= 60) return { label: 'Medium', color: 'text-yellow-500', variant: 'secondary' };
  return { label: 'High', color: 'text-red-500', variant: 'destructive' };
}

function computeRiskFactors(startup: Startup): RiskFactor[] {
  const factors: RiskFactor[] = [];

  // Funding stage risk
  const stageRisk: Record<string, number> = { pre_seed: 85, seed: 70, series_a: 50, series_b: 35, series_c: 20 };
  factors.push({
    label: 'Stage Risk',
    score: stageRisk[startup.funding_stage] ?? 60,
    icon: <Clock className="h-4 w-4" />,
    detail: `${FUNDING_STAGE_LABELS[startup.funding_stage]} stage — ${stageRisk[startup.funding_stage] >= 70 ? 'early-stage startups carry higher failure risk' : 'later stages have more traction and validation'}`,
  });

  // Funding progress risk
  const fundingPct = (startup.amount_raised / startup.funding_goal) * 100;
  const fundingRisk = fundingPct > 80 ? 20 : fundingPct > 50 ? 40 : fundingPct > 20 ? 60 : 80;
  factors.push({
    label: 'Funding Progress',
    score: fundingRisk,
    icon: <DollarSign className="h-4 w-4" />,
    detail: `${fundingPct.toFixed(0)}% of goal raised — ${fundingRisk <= 40 ? 'strong fundraising momentum' : 'still early in fundraising'}`,
  });

  // Team size risk
  const teamSize = startup.team_size ?? 0;
  const teamRisk = teamSize >= 20 ? 20 : teamSize >= 10 ? 35 : teamSize >= 5 ? 50 : 75;
  factors.push({
    label: 'Team Strength',
    score: teamRisk,
    icon: <Users className="h-4 w-4" />,
    detail: teamSize ? `${teamSize} team members — ${teamRisk <= 35 ? 'solid team foundation' : 'small team increases execution risk'}` : 'Team size not disclosed',
  });

  // Valuation risk
  const valuation = startup.valuation ?? 10000000;
  const valToRaised = startup.amount_raised > 0 ? valuation / startup.amount_raised : 100;
  const valRisk = valToRaised > 50 ? 80 : valToRaised > 20 ? 55 : valToRaised > 10 ? 35 : 20;
  factors.push({
    label: 'Valuation Risk',
    score: valRisk,
    icon: <TrendingUp className="h-4 w-4" />,
    detail: `Valuation-to-raised ratio: ${valToRaised.toFixed(1)}x — ${valRisk >= 55 ? 'high valuation relative to traction' : 'reasonable valuation'}`,
  });

  // Market / sector risk (simplified heuristic)
  const sectorRisk: Record<string, number> = {
    technology: 50, healthcare: 55, fintech: 45, edtech: 50, ecommerce: 40,
    green_energy: 60, real_estate: 35, consumer: 55, manufacturing: 40,
    agriculture: 55, logistics: 40, media_entertainment: 65,
  };
  factors.push({
    label: 'Market Risk',
    score: sectorRisk[startup.sector] ?? 50,
    icon: <Shield className="h-4 w-4" />,
    detail: `Sector-specific market risk based on industry volatility and competition`,
  });

  return factors;
}

export function RiskAnalysis({ startup }: RiskAnalysisProps) {
  const factors = computeRiskFactors(startup);
  const overallScore = Math.round(factors.reduce((sum, f) => sum + f.score, 0) / factors.length);
  const overall = getRiskLevel(overallScore);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Risk Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Overall Risk */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <p className="text-sm text-muted-foreground">Overall Risk Score</p>
            <p className="text-2xl font-bold">{overallScore}<span className="text-sm font-normal text-muted-foreground">/100</span></p>
          </div>
          <Badge variant={overall.variant} className="text-sm px-3 py-1">
            {overall.label} Risk
          </Badge>
        </div>

        {/* Individual Factors */}
        <div className="space-y-4">
          {factors.map((factor) => {
            const level = getRiskLevel(factor.score);
            return (
              <div key={factor.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    {factor.icon}
                    {factor.label}
                  </span>
                  <span className={level.color}>{factor.score}/100</span>
                </div>
                <Progress
                  value={factor.score}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">{factor.detail}</p>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground border-t pt-3">
          ⚠️ This risk analysis is algorithmically generated and should not be the sole basis for investment decisions. Always do your own due diligence.
        </p>
      </CardContent>
    </Card>
  );
}
