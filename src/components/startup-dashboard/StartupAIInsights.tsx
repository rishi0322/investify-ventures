import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Startup, SECTOR_LABELS, FUNDING_STAGE_LABELS } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Brain, Sparkles, Loader2, Lightbulb, Target, TrendingUp,
  AlertTriangle, CheckCircle2, ArrowRight, Zap, BarChart2, Shield
} from 'lucide-react';

interface Props {
  startup: Startup;
  investments: any[];
}

interface AIInsight {
  category: 'strength' | 'improvement' | 'opportunity' | 'risk';
  title: string;
  description: string;
  actionable: string;
}

interface AIAnalysis {
  overallScore: number;
  summary: string;
  insights: AIInsight[];
  competitorBenchmark: string;
  growthPrediction: string;
}

export function StartupAIInsights({ startup, investments }: Props) {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);

    try {
      const totalRaised = investments.reduce((s, i) => s + i.amount, 0);
      const investorCount = new Set(investments.map(i => i.investor_id)).size;
      const avgInvestment = investments.length > 0 ? totalRaised / investments.length : 0;
      const fundingProgress = (totalRaised / startup.funding_goal) * 100;

      const { data, error } = await supabase.functions.invoke('ai-startup-insights', {
        body: {
          startup: {
            name: startup.name,
            sector: startup.sector,
            sectorLabel: SECTOR_LABELS[startup.sector],
            fundingStage: startup.funding_stage,
            fundingStageLabel: FUNDING_STAGE_LABELS[startup.funding_stage],
            fundingGoal: startup.funding_goal,
            amountRaised: totalRaised,
            fundingProgress,
            minInvestment: startup.min_investment,
            valuation: startup.valuation || 10000000,
            teamSize: startup.team_size,
            location: startup.location,
            foundedYear: startup.founded_year,
            tagline: startup.tagline,
            description: startup.description.substring(0, 500),
            investorCount,
            investmentCount: investments.length,
            avgInvestment,
            hasWebsite: !!startup.website_url,
            hasPitchDeck: !!startup.pitch_deck_url,
            hasPitchVideo: !!startup.pitch_video_url,
          }
        }
      });

      if (error) throw error;

      setAnalysis(data);
      toast({
        title: '🧠 AI Analysis Complete',
        description: 'Your startup has been analyzed with personalized insights.',
      });
    } catch (error: any) {
      console.error('AI insights error:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis failed',
        description: error.message || 'Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength': return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'improvement': return <Lightbulb className="h-5 w-5 text-primary" />;
      case 'opportunity': return <TrendingUp className="h-5 w-5 text-accent" />;
      case 'risk': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default: return <Zap className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength': return 'border-success/20 bg-success/5';
      case 'improvement': return 'border-primary/20 bg-primary/5';
      case 'opportunity': return 'border-accent/20 bg-accent/5';
      case 'risk': return 'border-destructive/20 bg-destructive/5';
      default: return 'border-border';
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'strength': return <Badge className="bg-success/10 text-success border-success/20">Strength</Badge>;
      case 'improvement': return <Badge className="bg-primary/10 text-primary border-primary/20">Improve</Badge>;
      case 'opportunity': return <Badge className="bg-accent/10 text-accent border-accent/20">Opportunity</Badge>;
      case 'risk': return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Risk</Badge>;
      default: return <Badge variant="secondary">Info</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Startup Insights
          </CardTitle>
          <CardDescription>
            Get personalized AI analysis of your startup's performance, market position, and growth opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runAnalysis} disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Analyzing Your Startup...
              </>
            ) : analysis ? (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Re-analyze
              </>
            ) : (
              <>
                <Brain className="h-5 w-5 mr-2" />
                Generate AI Insights
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <>
          {/* Overall Score */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className="relative w-28 h-28 mb-4">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="hsl(222, 30%, 18%)" strokeWidth="8" fill="none" />
                    <circle cx="50" cy="50" r="42" stroke="hsl(38, 92%, 50%)" strokeWidth="8" fill="none"
                      strokeDasharray={`${analysis.overallScore * 2.64} 264`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{analysis.overallScore}</span>
                  </div>
                </div>
                <p className="text-sm font-medium">Startup Health Score</p>
                <p className="text-xs text-muted-foreground mt-1">out of 100</p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-primary" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
                
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Market Position</p>
                    <p className="text-sm font-medium">{analysis.competitorBenchmark}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Growth Outlook</p>
                    <p className="text-sm font-medium">{analysis.growthPrediction}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Insights */}
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.insights.map((insight, index) => (
              <Card key={index} className={getCategoryColor(insight.category)}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    {getCategoryIcon(insight.category)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        {getCategoryBadge(insight.category)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      <div className="flex items-start gap-1.5 p-2 rounded bg-background/50 border border-border/50">
                        <ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <p className="text-xs font-medium">{insight.actionable}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
