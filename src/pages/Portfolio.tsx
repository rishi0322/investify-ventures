import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Investment, Startup } from '@/types/database';
import { PortfolioCard } from '@/components/portfolio/PortfolioCard';
import { PortfolioStats } from '@/components/portfolio/PortfolioStats';
import { PortfolioCharts } from '@/components/portfolio/PortfolioCharts';
import { AIRecommendationsPanel } from '@/components/portfolio/AIRecommendationsPanel';
import { TradeDialog } from '@/components/portfolio/TradeDialog';
import { 
  ArrowUpRight,
  RefreshCcw,
  LayoutGrid,
  List,
  TrendingUp,
  Loader2,
  Briefcase
} from 'lucide-react';

export default function Portfolio() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<(Investment & { startup: Startup })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [tradeTarget, setTradeTarget] = useState<(Investment & { startup: Startup }) | null>(null);
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [tradeHistory, setTradeHistory] = useState<{ id: string; action: string; amount: number; pnl: number; time: Date; startup: string }[]>([]);

  // Generate consistent simulated changes for each investment
  const [simulatedChanges, setSimulatedChanges] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!authLoading && (!user || role !== 'investor')) {
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchInvestments();
    }
  }, [user]);

  // Live stock-market-like price simulation every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (investments.length > 0) {
        setSimulatedChanges(prev => {
          const newChanges: Record<string, number> = {};
          investments.forEach(inv => {
            const currentChange = prev[inv.id] || 0;
            // Small random walk with slight positive bias
            const volatility = (Math.random() - 0.47) * 1.2;
            newChanges[inv.id] = Math.max(-20, Math.min(30, currentChange + volatility));
          });
          return newChanges;
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [investments]);

  const fetchInvestments = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
    const { data, error } = await supabase
      .from('investments')
      .select(`
        *,
        startup:startups(*)
      `)
      .eq('investor_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const typedData = data as (Investment & { startup: Startup })[];
      setInvestments(typedData);
      
      // Initialize simulated changes
      const changes: Record<string, number> = {};
      typedData.forEach(inv => {
        changes[inv.id] = (Math.random() - 0.4) * 20; // -8% to +12% bias positive
      });
      setSimulatedChanges(changes);
    }
    
    setLoading(false);
    setRefreshing(false);
  };

  // Calculate portfolio metrics
  const metrics = useMemo(() => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    
    const currentValue = investments.reduce((sum, inv) => {
      const change = simulatedChanges[inv.id] || 0;
      return sum + inv.amount * (1 + change / 100);
    }, 0);

    const totalCompanies = new Set(investments.map(inv => inv.startup_id)).size;
    
    const avgEquity = investments.reduce((sum, inv) => {
      const valuation = inv.startup?.valuation || 10000000;
      return sum + (inv.amount / valuation) * 100;
    }, 0) / (investments.length || 1);

    return { totalInvested, currentValue, totalCompanies, avgEquity };
  }, [investments, simulatedChanges]);

  // Simulated values map for charts
  const simulatedValues = useMemo(() => {
    const values: Record<string, number> = {};
    investments.forEach(inv => {
      const change = simulatedChanges[inv.id] || 0;
      values[inv.id] = inv.amount * (1 + change / 100);
    });
    return values;
  }, [investments, simulatedChanges]);

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-64 mb-6" />
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
                <Briefcase className="h-5 w-5 text-primary-foreground" />
              </div>
              Portfolio Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your investments with real-time equity value changes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchInvestments(true)}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">Refresh</span>
            </Button>
            <Button asChild>
              <Link to="/startups">
                Explore Startups
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <PortfolioStats 
          totalInvested={metrics.totalInvested}
          currentValue={metrics.currentValue}
          totalCompanies={metrics.totalCompanies}
          totalEquity={metrics.avgEquity}
        />

        {/* Charts */}
        <div className="mt-6">
          <PortfolioCharts 
            investments={investments} 
            simulatedValues={simulatedValues}
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          {/* Investments List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Your Holdings
                </CardTitle>
                <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {investments.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <Briefcase className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No investments yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Start building your portfolio by investing in promising startups
                    </p>
                    <Button asChild size="lg">
                      <Link to="/startups">
                        Browse Startups
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 gap-4' : 'space-y-4'}>
                    {investments.map((investment) => (
                      <PortfolioCard 
                        key={investment.id} 
                        investment={investment}
                        simulatedChange={simulatedChanges[investment.id]}
                        onTrade={(inv) => {
                          setTradeTarget(inv);
                          setTradeDialogOpen(true);
                        }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations */}
          <div>
            {user && (
              <AIRecommendationsPanel 
                userId={user.id} 
                investments={investments}
              />
            )}
          </div>
        </div>
      </div>

      {/* Trade Dialog */}
      <TradeDialog
        open={tradeDialogOpen}
        onOpenChange={setTradeDialogOpen}
        investment={tradeTarget}
        simulatedChange={tradeTarget ? (simulatedChanges[tradeTarget.id] || 0) : 0}
        onTradeComplete={(investmentId, action, amount, pnl) => {
          setTradeHistory(prev => [...prev, {
            id: investmentId,
            action,
            amount,
            pnl,
            time: new Date(),
            startup: tradeTarget?.startup?.name || '',
          }]);
        }}
      />
    </Layout>
  );
}
