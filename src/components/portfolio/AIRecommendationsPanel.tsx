import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Startup, SECTOR_LABELS, SECTOR_ICONS, Investment } from '@/types/database';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  ArrowRight,
  Loader2,
  RefreshCcw,
  Lightbulb,
  Target
} from 'lucide-react';

interface Recommendation {
  startup_id: string;
  startup_name: string;
  match_score: number;
  reasoning: string;
}

interface AIRecommendationsPanelProps {
  userId: string;
  investments: (Investment & { startup: Startup })[];
}

export function AIRecommendationsPanel({ userId, investments }: AIRecommendationsPanelProps) {
  const { toast } = useToast();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchStartups();
  }, []);

  const fetchStartups = async () => {
    const { data } = await supabase
      .from('startups')
      .select('*')
      .eq('verification_status', 'approved');
    
    setStartups((data || []) as Startup[]);
    setLoading(false);
  };

  const runAIAnalysis = async () => {
    if (startups.length === 0) {
      toast({ variant: 'destructive', title: 'No startups available' });
      return;
    }

    setAnalyzing(true);

    // Analyze user's investment patterns
    const investedSectors = investments.map(inv => inv.startup?.sector);
    const avgInvestment = investments.length > 0 
      ? investments.reduce((sum, inv) => sum + inv.amount, 0) / investments.length 
      : 50000;
    const preferredStages = investments.map(inv => inv.startup?.funding_stage);

    // Get sector frequency
    const sectorFreq: Record<string, number> = {};
    investedSectors.forEach(s => {
      if (s) sectorFreq[s] = (sectorFreq[s] || 0) + 1;
    });
    const topSectors = Object.entries(sectorFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([sector]) => sector);

    try {
      const { data, error } = await supabase.functions.invoke('ai-startup-matching', {
        body: {
          investorPreferences: {
            sectors: topSectors.length > 0 ? topSectors : null,
            fundingStage: preferredStages[0] || null,
            minInvestment: Math.max(500, avgInvestment * 0.5),
            maxInvestment: avgInvestment * 2,
            riskTolerance: investments.length > 5 ? 'High' : investments.length > 2 ? 'Medium' : 'Low',
            existingPortfolio: investments.map(inv => ({
              startupId: inv.startup_id,
              sector: inv.startup?.sector,
              amount: inv.amount
            }))
          },
          startups: startups
            .filter(s => !investments.some(inv => inv.startup_id === s.id)) // Exclude already invested
            .map(s => ({
              id: s.id,
              name: s.name,
              sector: s.sector,
              funding_stage: s.funding_stage,
              tagline: s.tagline,
              description: s.description?.substring(0, 300) || '',
              funding_goal: s.funding_goal,
              amount_raised: s.amount_raised,
              min_investment: s.min_investment,
              valuation: s.valuation
            }))
        }
      });

      if (error) throw error;

      setRecommendations(data.recommendations || []);
      
      toast({ 
        title: 'AI Analysis Complete!', 
        description: `Found ${data.recommendations?.length || 0} recommendations based on your portfolio.` 
      });
    } catch (error: any) {
      console.error('AI analysis error:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Analysis failed', 
        description: error.message 
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getStartup = (id: string) => startups.find(s => s.id === id);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Brain className="h-4 w-4 text-primary-foreground" />
              </div>
              AI Investment Advisor
            </CardTitle>
            <CardDescription className="mt-1">
              Personalized recommendations based on your portfolio
            </CardDescription>
          </div>
          <Button 
            onClick={runAIAnalysis} 
            disabled={analyzing}
            size="sm"
            className="gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Lightbulb className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Get AI-Powered Recommendations</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Our AI analyzes your investment patterns and finds startups that match your preferences and risk profile.
            </p>
            <Button onClick={runAIAnalysis} disabled={analyzing} className="gap-2">
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing Portfolio...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Get Recommendations
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.slice(0, 5).map((rec) => {
              const startup = getStartup(rec.startup_id);
              if (!startup) return null;

              return (
                <div 
                  key={rec.startup_id} 
                  className="p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all bg-card/50"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                        {SECTOR_ICONS[startup.sector]}
                      </div>
                      <div>
                        <h4 className="font-semibold">{rec.startup_name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {SECTOR_LABELS[startup.sector]} · Min ₹{startup.min_investment.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-accent" />
                        <span className="text-xl font-bold text-accent">{rec.match_score}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Match</p>
                    </div>
                  </div>
                  
                  <Progress value={rec.match_score} className="h-1.5 mb-3" />
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{rec.reasoning}</p>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link to={`/startups/${startup.id}`}>
                        View Details
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                    <Button size="sm" asChild className="flex-1">
                      <Link to={`/startups/${startup.id}`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Invest Now
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {recommendations.length > 5 && (
              <Button variant="outline" asChild className="w-full">
                <Link to="/ai-matching">
                  View All {recommendations.length} Recommendations
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
