import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Investment, Startup, SECTOR_LABELS, SECTOR_ICONS } from '@/types/database';
import { MarketTrends } from '@/components/dashboard/MarketTrends';
import { StockTwits } from '@/components/dashboard/StockTwits';
import { InvestmentSummary } from '@/components/dashboard/InvestmentSummary';
import { WalletWidget } from '@/components/dashboard/WalletWidget';
import { AIRecommendationsPanel } from '@/components/portfolio/AIRecommendationsPanel';
import { 
  TrendingUp, 
  Wallet, 
  Building2, 
  ArrowUpRight,
  Clock,
  Eye,
  Briefcase,
  MessageCircle,
  BarChart2,
  Sparkles,
  Youtube
} from 'lucide-react';

export default function InvestorDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<(Investment & { startup: Startup })[]>([]);
  const [watchlist, setWatchlist] = useState<{ startup: Startup }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!authLoading && (!user || role !== 'investor')) {
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    // Fetch investments
    const { data: invData } = await supabase
      .from('investments')
      .select(`*, startup:startups(*)`)
      .eq('investor_id', user?.id)
      .order('created_at', { ascending: false });

    if (invData) {
      setInvestments(invData as (Investment & { startup: Startup })[]);
    }

    // Fetch watchlist
    const { data: watchData } = await supabase
      .from('watchlist')
      .select(`startup:startups(*)`)
      .eq('user_id', user?.id);

    if (watchData) {
      setWatchlist(watchData as { startup: Startup }[]);
    }

    setLoading(false);
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const uniqueStartups = new Set(investments.map(inv => inv.startup_id)).size;

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Investor Dashboard</h1>
            <p className="text-muted-foreground">Track investments, discover startups & manage your portfolio</p>
          </div>
          <Button asChild>
            <Link to="/startups">
              Start Investing
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Invested</p>
                  <p className="text-xl font-bold">₹{totalInvested.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Startups Invested</p>
                  <p className="text-xl font-bold">{uniqueStartups}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Watchlist</p>
                  <p className="text-xl font-bold">{watchlist.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Investments</p>
                  <p className="text-xl font-bold">{investments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="overview" className="text-xs">
              <Briefcase className="h-3 w-3 mr-1" />
              My Portfolio
            </TabsTrigger>
            <TabsTrigger value="wallet" className="text-xs">
              <Wallet className="h-3 w-3 mr-1" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="trends" className="text-xs">
              <BarChart2 className="h-3 w-3 mr-1" />
              Market Trends
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Picks
            </TabsTrigger>
            <TabsTrigger value="community" className="text-xs">
              <MessageCircle className="h-3 w-3 mr-1" />
              Community
            </TabsTrigger>
          </TabsList>

          {/* Portfolio Tab */}
          <TabsContent value="overview">
            <InvestmentSummary investments={investments} />
            
            {/* Watchlist */}
            {watchlist.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    My Watchlist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {watchlist.slice(0, 6).map((item) => (
                      <Link
                        key={item.startup.id}
                        to={`/startups/${item.startup.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xl shrink-0">
                          {item.startup.logo_url ? (
                            <img src={item.startup.logo_url} alt={item.startup.name} className="h-full w-full object-cover rounded-lg" />
                          ) : (
                            SECTOR_ICONS[item.startup.sector]
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.startup.name}</p>
                          <p className="text-xs text-muted-foreground">{SECTOR_LABELS[item.startup.sector]}</p>
                        </div>
                        {item.startup.pitch_video_url && (
                          <Youtube className="h-4 w-4 text-destructive" />
                        )}
                      </Link>
                    ))}
                  </div>
                  {watchlist.length > 6 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" asChild>
                        <Link to="/watchlist">View All ({watchlist.length})</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                {user && <WalletWidget userId={user.id} />}
              </div>
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="py-12 text-center">
                    <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Full Wallet Management</h3>
                    <p className="text-muted-foreground mb-4">Access detailed transaction history, security settings, and more</p>
                    <Button asChild>
                      <Link to="/wallet">
                        Go to Wallet
                        <ArrowUpRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Market Trends Tab */}
          <TabsContent value="trends">
            <MarketTrends />
          </TabsContent>

          {/* AI Recommendations Tab */}
          <TabsContent value="ai">
            <div className="grid lg:grid-cols-2 gap-6">
              {user && (
                <AIRecommendationsPanel userId={user.id} investments={investments} />
              )}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-destructive" />
                    Featured Pitch Videos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {investments.filter(inv => inv.startup?.pitch_video_url).slice(0, 3).map((inv) => (
                      <Link
                        key={inv.id}
                        to={`/startups/${inv.startup_id}`}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50"
                      >
                        <div className="w-16 h-10 bg-muted rounded flex items-center justify-center">
                          <Youtube className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                          <p className="font-medium">{inv.startup?.name}</p>
                          <p className="text-xs text-muted-foreground">Watch pitch video</p>
                        </div>
                      </Link>
                    ))}
                    {investments.filter(inv => inv.startup?.pitch_video_url).length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No pitch videos available yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community">
            <StockTwits />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
