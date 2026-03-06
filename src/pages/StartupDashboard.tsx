import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Startup, SECTOR_LABELS, FUNDING_STAGE_LABELS } from '@/types/database';
import { StartupEditForm } from '@/components/startup-dashboard/StartupEditForm';
import { StartupVerificationStatus } from '@/components/startup-dashboard/StartupVerificationStatus';
import { StartupGrowthChart } from '@/components/startup-dashboard/StartupGrowthChart';
import { StartupInvestorsList } from '@/components/startup-dashboard/StartupInvestorsList';
import { StartupAIMatchmaking } from '@/components/startup-dashboard/StartupAIMatchmaking';
import { StartupProfileViews } from '@/components/startup-dashboard/StartupProfileViews';
import { StartupAIInsights } from '@/components/startup-dashboard/StartupAIInsights';
import { StartupMilestones } from '@/components/startup-dashboard/StartupMilestones';
import { StartupFundingReport } from '@/components/startup-dashboard/StartupFundingReport';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import {
  TrendingUp, Users, Shield, Edit, BarChart2,
  DollarSign, UserCircle, Percent, Brain, Eye, Sparkles, Trophy, FileBarChart
} from 'lucide-react';

export default function StartupDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
    if (!authLoading && role && role !== 'startup') navigate('/dashboard');
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchStartupData();
  }, [user]);

  const fetchStartupData = async () => {
    const { data: startupData } = await supabase
      .from('startups')
      .select('*')
      .eq('founder_id', user!.id)
      .maybeSingle();

    if (startupData) {
      setStartup(startupData as Startup);

      const { data: invData } = await supabase
        .from('investments')
        .select('*')
        .eq('startup_id', startupData.id)
        .order('created_at', { ascending: false });

      if (invData) setInvestments(invData);
    }
    setLoading(false);
  };

  const totalRaised = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalEquityGiven = investments.reduce((sum, inv) => sum + (inv.equity_percentage || 0), 0);
  const totalShares = investments.reduce((sum, inv) => sum + (inv.shares_acquired || 0), 0);
  const investorCount = new Set(investments.map(inv => inv.investor_id)).size;

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

  if (!startup) {
    navigate('/register-startup');
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {startup.name}
              </span>
              <Badge
                variant={startup.verification_status === 'approved' ? 'default' : 'secondary'}
                className={startup.verification_status === 'approved' ? 'bg-success text-success-foreground' : ''}
              >
                {startup.verification_status === 'approved' ? '✓ Verified' : startup.verification_status === 'pending' ? '⏳ Pending' : '✕ Rejected'}
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1">{startup.tagline}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Raised</p>
                  <p className="text-2xl font-bold mt-1">₹{totalRaised.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    of ₹{startup.funding_goal.toLocaleString('en-IN')} goal
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Equity Given</p>
                  <p className="text-2xl font-bold mt-1">{totalEquityGiven.toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalShares.toLocaleString()} shares
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Percent className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Investors</p>
                  <p className="text-2xl font-bold mt-1">{investorCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">{investments.length} investments</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-info/5 to-info/10 border-info/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Valuation</p>
                  <p className="text-2xl font-bold mt-1">₹{((startup.valuation || 0) / 10000000).toFixed(1)}Cr</p>
                  <p className="text-xs text-muted-foreground mt-1">{FUNDING_STAGE_LABELS[startup.funding_stage]}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-info/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto -mx-4 px-4">
            <TabsList className="inline-flex w-auto min-w-full lg:grid lg:grid-cols-10 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
                <BarChart2 className="h-4 w-4 mr-1.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="views" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
                <Eye className="h-4 w-4 mr-1.5" />
                Profile Views
              </TabsTrigger>
              <TabsTrigger value="ai-insights" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
                <Sparkles className="h-4 w-4 mr-1.5" />
                AI Insights
              </TabsTrigger>
              <TabsTrigger value="funding-report" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
                <FileBarChart className="h-4 w-4 mr-1.5" />
                AI Reports
              </TabsTrigger>
              <TabsTrigger value="matchmaking" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
                <Brain className="h-4 w-4 mr-1.5" />
                AI Matchmaking
              </TabsTrigger>
              <TabsTrigger value="milestones" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
                <Trophy className="h-4 w-4 mr-1.5" />
                Milestones
              </TabsTrigger>
              <TabsTrigger value="investors" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
                <Users className="h-4 w-4 mr-1.5" />
                Investors
              </TabsTrigger>
              <TabsTrigger value="edit" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
                <Edit className="h-4 w-4 mr-1.5" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="verification" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
                <Shield className="h-4 w-4 mr-1.5" />
                Verification
              </TabsTrigger>
              <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
                <UserCircle className="h-4 w-4 mr-1.5" />
                Profile
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <StartupGrowthChart startup={startup} investments={investments} />
          </TabsContent>

          <TabsContent value="views">
            <StartupProfileViews startup={startup} />
          </TabsContent>

          <TabsContent value="ai-insights">
            <StartupAIInsights startup={startup} investments={investments} />
          </TabsContent>

          <TabsContent value="funding-report">
            <StartupFundingReport startup={startup} investments={investments} />
          </TabsContent>

          <TabsContent value="matchmaking">
            <StartupAIMatchmaking startup={startup} founderId={user!.id} />
          </TabsContent>

          <TabsContent value="milestones">
            <StartupMilestones startup={startup} investments={investments} />
          </TabsContent>

          <TabsContent value="investors">
            <StartupInvestorsList investments={investments} startup={startup} />
          </TabsContent>

          <TabsContent value="edit">
            <StartupEditForm startup={startup} onUpdate={(updated) => setStartup(updated)} />
          </TabsContent>

          <TabsContent value="verification">
            <StartupVerificationStatus startup={startup} />
          </TabsContent>

          <TabsContent value="profile">
            {user && <ProfileSettings userId={user.id} />}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
