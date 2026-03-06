import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Investment, Startup, SECTOR_LABELS, SECTOR_ICONS, FUNDING_STAGE_LABELS } from '@/types/database';
import { MarketTrends } from '@/components/dashboard/MarketTrends';
import { StockTwits } from '@/components/dashboard/StockTwits';
import { InvestmentSummary } from '@/components/dashboard/InvestmentSummary';
import { WalletWidget } from '@/components/dashboard/WalletWidget';
import { AIRecommendationsPanel } from '@/components/portfolio/AIRecommendationsPanel';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { TradeHistory } from '@/components/investor-dashboard/TradeHistory';
import { sampleInvestments, sampleWatchlist } from '@/data/sampleInvestments';
import { 
  TrendingUp, 
  Wallet, 
  Building2, 
  ArrowUpRight,
  Eye,
  Briefcase,
  MessageCircle,
  BarChart2,
  Sparkles,
  Youtube,
  FlaskConical,
  Users,
  Target,
  Activity,
  Bell,
  Settings,
  PieChart,
  LineChart,
  Clock,
  CheckCircle2,
  Star,
  Globe,
  Shield,
  UserCircle
} from 'lucide-react';

interface DashboardStats {
  totalInvested: number;
  totalReturns: number;
  activeInvestments: number;
  watchlistCount: number;
  portfolioGrowth: number;
}

export default function UserDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<(Investment & { startup: Startup })[]>([]);
  const [watchlist, setWatchlist] = useState<{ startup: Startup }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [demoMode, setDemoMode] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalInvested: 0,
    totalReturns: 0,
    activeInvestments: 0,
    watchlistCount: 0,
    portfolioGrowth: 0
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

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

  // Use demo data or real data based on demoMode toggle
  const displayInvestments = demoMode ? sampleInvestments : investments;
  const displayWatchlist = demoMode ? sampleWatchlist : watchlist;

  const totalInvested = displayInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const uniqueStartups = new Set(displayInvestments.map(inv => inv.startup_id)).size;
  const estimatedReturns = totalInvested * 1.24; // 24% simulated growth
  const portfolioGrowth = 24.5;

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welcome back, {user?.email?.split('@')[0] || 'Investor'}
              </span>
              {demoMode && (
                <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                  <FlaskConical className="h-3 w-3 mr-1" />
                  Demo Mode
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              Your investment command center • Last updated just now
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
              <Switch 
                id="demo-mode" 
                checked={demoMode} 
                onCheckedChange={setDemoMode}
              />
              <Label htmlFor="demo-mode" className="text-sm cursor-pointer">
                Demo Data
              </Label>
            </div>
            <Button asChild className="shadow-lg">
              <Link to="/startups">
                <Target className="mr-2 h-4 w-4" />
                Explore Startups
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Invested</p>
                  <p className="text-2xl font-bold mt-1">₹{totalInvested.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-success flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +12.5% this month
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Portfolio Value</p>
                  <p className="text-2xl font-bold mt-1">₹{Math.round(estimatedReturns).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-success flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +{portfolioGrowth}% growth
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
                  <LineChart className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Investments</p>
                  <p className="text-2xl font-bold mt-1">{displayInvestments.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across {uniqueStartups} startups
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-info/5 to-info/10 border-info/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Watchlist</p>
                  <p className="text-2xl font-bold mt-1">{displayWatchlist.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tracking opportunities
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-info/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-7 w-full max-w-4xl bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Briefcase className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <PieChart className="h-4 w-4 mr-2" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="wallet" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Wallet className="h-4 w-4 mr-2" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="ai" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Picks
            </TabsTrigger>
            <TabsTrigger value="trends" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BarChart2 className="h-4 w-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="community" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Social
            </TabsTrigger>
            <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <UserCircle className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link to="/startups">
                      <Target className="h-4 w-4 mr-3" />
                      Browse New Startups
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link to="/ai-matching">
                      <Sparkles className="h-4 w-4 mr-3" />
                      Get AI Recommendations
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link to="/wallet">
                      <Wallet className="h-4 w-4 mr-3" />
                      Manage Wallet
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link to="/portfolio">
                      <PieChart className="h-4 w-4 mr-3" />
                      View Full Portfolio
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link to="/messages">
                      <MessageCircle className="h-4 w-4 mr-3" />
                      Check Messages
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Recent Investments
                  </CardTitle>
                  <CardDescription>Your latest investment activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {displayInvestments.length === 0 ? (
                    <div className="text-center py-8">
                      <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">No investments yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">Start building your portfolio today</p>
                      <Button asChild>
                        <Link to="/startups">Explore Startups</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {displayInvestments.slice(0, 5).map((inv) => (
                        <Link
                          key={inv.id}
                          to={`/startups/${inv.startup_id}`}
                          className="flex items-center gap-4 p-3 rounded-xl border hover:bg-muted/50 transition-all hover:shadow-sm"
                        >
                          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
                            {inv.startup?.logo_url ? (
                              <img src={inv.startup.logo_url} alt={inv.startup?.name} className="h-full w-full object-cover rounded-xl" />
                            ) : (
                              SECTOR_ICONS[inv.startup?.sector || 'technology']
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{inv.startup?.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary" className="text-xs">
                                {SECTOR_LABELS[inv.startup?.sector || 'technology']}
                              </Badge>
                              <span>•</span>
                              <span>{new Date(inv.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">₹{inv.amount.toLocaleString('en-IN')}</p>
                            <p className="text-xs text-success">+{(Math.random() * 30 + 5).toFixed(1)}%</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Watchlist Section */}
            {displayWatchlist.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="h-5 w-5 text-warning" />
                      Watchlist
                    </CardTitle>
                    <CardDescription>Startups you're tracking</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/watchlist">View All</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayWatchlist.slice(0, 6).map((item) => (
                      <Link
                        key={item.startup.id}
                        to={`/startups/${item.startup.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/50 transition-all hover:shadow-sm"
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
                        <div className="flex items-center gap-1">
                          {item.startup.pitch_video_url && (
                            <Youtube className="h-4 w-4 text-destructive" />
                          )}
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Platform Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-primary/5 via-transparent to-transparent">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">150+</p>
                      <p className="text-xs text-muted-foreground">Active Startups</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-success/5 via-transparent to-transparent">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">10K+</p>
                      <p className="text-xs text-muted-foreground">Active Investors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-accent/5 via-transparent to-transparent">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">₹50Cr+</p>
                      <p className="text-xs text-muted-foreground">Total Invested</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <InvestmentSummary investments={displayInvestments} />
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

          {/* AI Recommendations Tab */}
          <TabsContent value="ai">
            <div className="grid lg:grid-cols-2 gap-6">
              {user && (
                <AIRecommendationsPanel userId={user.id} investments={displayInvestments} demoMode={demoMode} />
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
                    {displayInvestments.filter(inv => inv.startup?.pitch_video_url).slice(0, 3).map((inv) => (
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
                    {displayInvestments.filter(inv => inv.startup?.pitch_video_url).length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No pitch videos available yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Market Trends Tab */}
          <TabsContent value="trends">
            <MarketTrends />
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community">
            <StockTwits />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            {user && <ProfileSettings userId={user.id} />}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
