import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Startup, SECTOR_LABELS, SECTOR_ICONS, FUNDING_STAGE_LABELS, StartupSector, FundingStage } from '@/types/database';
import { 
  Brain, 
  Sparkles, 
  Target, 
  TrendingUp, 
  ArrowRight,
  Loader2,
  RefreshCcw,
  Zap
} from 'lucide-react';

interface Recommendation {
  startup_id: string;
  startup_name: string;
  match_score: number;
  reasoning: string;
}

const SECTORS: StartupSector[] = ['technology', 'healthcare', 'fintech', 'edtech', 'ecommerce', 'green_energy', 'real_estate', 'consumer', 'manufacturing', 'agriculture', 'logistics', 'media_entertainment'];
const FUNDING_STAGES: FundingStage[] = ['pre_seed', 'seed', 'series_a', 'series_b', 'series_c'];

export default function AIMatching() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [startups, setStartups] = useState<Startup[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Preferences
  const [selectedSectors, setSelectedSectors] = useState<StartupSector[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [riskTolerance, setRiskTolerance] = useState([50]);
  const [investmentRange, setInvestmentRange] = useState([500, 100000]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && role !== 'investor') {
      navigate('/startup-dashboard');
    } else if (user) {
      fetchStartups();
    }
  }, [user, role, authLoading, navigate]);

  const fetchStartups = async () => {
    const { data } = await supabase
      .from('startups')
      .select('*')
      .eq('verification_status', 'approved');
    
    setStartups((data || []) as Startup[]);
    setLoading(false);
  };

  const runAIMatching = async () => {
    if (startups.length === 0) {
      toast({ variant: 'destructive', title: 'No startups available for matching' });
      return;
    }

    setAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-startup-matching', {
        body: {
          investorPreferences: {
            sectors: selectedSectors.length > 0 ? selectedSectors : null,
            fundingStage: selectedStage || null,
            minInvestment: investmentRange[0],
            maxInvestment: investmentRange[1],
            riskTolerance: riskTolerance[0] < 33 ? 'Low' : riskTolerance[0] < 66 ? 'Medium' : 'High'
          },
          startups: startups.map(s => ({
            id: s.id,
            name: s.name,
            sector: s.sector,
            funding_stage: s.funding_stage,
            tagline: s.tagline,
            description: s.description.substring(0, 300),
            funding_goal: s.funding_goal,
            amount_raised: s.amount_raised,
            min_investment: s.min_investment
          }))
        }
      });

      if (error) throw error;

      setRecommendations(data.recommendations || []);
      
      toast({ 
        title: 'AI Analysis Complete!', 
        description: `Found ${data.recommendations?.length || 0} matching startups for you.` 
      });
    } catch (error: any) {
      console.error('AI matching error:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Analysis failed', 
        description: error.message 
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleSector = (sector: StartupSector) => {
    setSelectedSectors(prev => 
      prev.includes(sector) 
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  const getMatchedStartup = (id: string) => startups.find(s => s.id === id);

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            AI-Powered Matching
          </div>
          <h1 className="text-4xl font-display font-bold mb-4">
            Find Your Perfect <span className="text-gradient">Startup Match</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI analyzes your investment preferences and matches you with startups that align with your goals, risk tolerance, and interests.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preferences Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Investment Preferences
              </CardTitle>
              <CardDescription>
                Customize your preferences to get personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sectors */}
              <div>
                <label className="text-sm font-medium mb-3 block">Preferred Sectors</label>
                <div className="flex flex-wrap gap-2">
                  {SECTORS.map((sector) => (
                    <Badge
                      key={sector}
                      variant={selectedSectors.includes(sector) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={() => toggleSector(sector)}
                    >
                      {SECTOR_ICONS[sector]} {SECTOR_LABELS[sector]}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Funding Stage */}
              <div>
                <label className="text-sm font-medium mb-3 block">Preferred Funding Stage</label>
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any stage</SelectItem>
                    {FUNDING_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {FUNDING_STAGE_LABELS[stage]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Risk Tolerance */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Risk Tolerance: {riskTolerance[0] < 33 ? 'Low' : riskTolerance[0] < 66 ? 'Medium' : 'High'}
                </label>
                <Slider
                  value={riskTolerance}
                  onValueChange={setRiskTolerance}
                  max={100}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Conservative</span>
                  <span>Aggressive</span>
                </div>
              </div>

              {/* Investment Range */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Investment Range: ₹{investmentRange[0].toLocaleString()} - ₹{investmentRange[1].toLocaleString()}
                </label>
                <Slider
                  value={investmentRange}
                  onValueChange={setInvestmentRange}
                  min={500}
                  max={500000}
                  step={500}
                />
              </div>

              <Button 
                className="w-full" 
                size="lg" 
                onClick={runAIMatching}
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing Startups...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5 mr-2" />
                    Run AI Matching
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                AI Recommendations
              </CardTitle>
              <CardDescription>
                Startups matched to your investment profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-2">No recommendations yet</p>
                  <p className="text-sm text-muted-foreground">
                    Set your preferences and click "Run AI Matching" to get personalized startup recommendations.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => {
                    const startup = getMatchedStartup(rec.startup_id);
                    if (!startup) return null;

                    return (
                      <div key={rec.startup_id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                              {SECTOR_ICONS[startup.sector]}
                            </div>
                            <div>
                              <h3 className="font-semibold">{rec.startup_name}</h3>
                              <p className="text-sm text-muted-foreground">{SECTOR_LABELS[startup.sector]}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-accent">{rec.match_score}%</div>
                            <p className="text-xs text-muted-foreground">Match</p>
                          </div>
                        </div>
                        
                        <Progress value={rec.match_score} className="h-2 mb-3" />
                        
                        <p className="text-sm text-muted-foreground mb-3">{rec.reasoning}</p>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild className="flex-1">
                            <Link to={`/startups/${startup.id}`}>
                              View Details
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                          </Button>
                          <Button size="sm" asChild className="flex-1">
                            <Link to={`/startups/${startup.id}`}>
                              <TrendingUp className="h-4 w-4 mr-1" />
                              Invest
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
