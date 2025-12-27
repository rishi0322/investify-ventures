import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Investment, Startup, SECTOR_LABELS, SECTOR_ICONS } from '@/types/database';
import { 
  TrendingUp, 
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart3,
  Wallet,
  Target,
  Activity
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

interface InvestmentWithStartup extends Investment {
  startup: Startup;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Analytics() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  
  const [investments, setInvestments] = useState<InvestmentWithStartup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && role !== 'investor') {
      navigate('/startup-dashboard');
    } else if (user) {
      fetchInvestments();
    }
  }, [user, role, authLoading, navigate]);

  const fetchInvestments = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('investments')
      .select('*, startup:startups(*)')
      .eq('investor_id', user.id)
      .order('created_at', { ascending: true });

    setInvestments((data || []) as InvestmentWithStartup[]);
    setLoading(false);
  };

  // Calculate analytics data
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const uniqueStartups = new Set(investments.map(inv => inv.startup_id)).size;
  const avgInvestment = investments.length > 0 ? totalInvested / investments.length : 0;

  // Sector distribution
  const sectorData = investments.reduce((acc, inv) => {
    const sector = inv.startup?.sector || 'unknown';
    acc[sector] = (acc[sector] || 0) + inv.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(sectorData).map(([sector, value]) => ({
    name: SECTOR_LABELS[sector as keyof typeof SECTOR_LABELS] || sector,
    value,
    icon: SECTOR_ICONS[sector as keyof typeof SECTOR_ICONS] || '📊'
  }));

  // Monthly investment trend
  const monthlyData = investments.reduce((acc, inv) => {
    const month = new Date(inv.created_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    acc[month] = (acc[month] || 0) + inv.amount;
    return acc;
  }, {} as Record<string, number>);

  const lineData = Object.entries(monthlyData).map(([month, amount]) => ({
    month,
    amount
  }));

  // Funding stage distribution
  const stageData = investments.reduce((acc, inv) => {
    const stage = inv.startup?.funding_stage || 'unknown';
    acc[stage] = (acc[stage] || 0) + inv.amount;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(stageData).map(([stage, amount]) => ({
    stage: stage.replace('_', ' ').toUpperCase(),
    amount
  }));

  // ROI simulation (demo)
  const simulatedROI = investments.map(inv => ({
    name: inv.startup?.name || 'Unknown',
    invested: inv.amount,
    currentValue: inv.amount * (1 + (Math.random() * 0.5 - 0.1)), // -10% to +40%
    roi: ((Math.random() * 0.5 - 0.1) * 100).toFixed(1)
  }));

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Investment Analytics</h1>
          <p className="text-muted-foreground">Track your portfolio performance and investment insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="text-2xl font-bold">₹{totalInvested.toLocaleString('en-IN')}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Portfolio Companies</p>
                  <p className="text-2xl font-bold">{uniqueStartups}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Investment</p>
                  <p className="text-2xl font-bold">₹{avgInvestment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Est. Portfolio Value</p>
                  <p className="text-2xl font-bold text-accent">
                    ₹{(totalInvested * 1.15).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
              </div>
              <p className="text-xs text-accent mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +15% (simulated)
              </p>
            </CardContent>
          </Card>
        </div>

        {investments.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Activity className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-2">No investments yet</p>
              <p className="text-sm text-muted-foreground">Start investing to see your analytics and portfolio performance.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Charts Row 1 */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    Sector Allocation
                  </CardTitle>
                  <CardDescription>Distribution of investments by sector</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Investment by Stage
                  </CardTitle>
                  <CardDescription>Funding stage distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="stage" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip 
                        formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Investment Timeline
                  </CardTitle>
                  <CardDescription>Monthly investment activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip 
                        formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Invested']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary) / 0.2)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    Portfolio Performance
                  </CardTitle>
                  <CardDescription>Simulated ROI by company (demo)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {simulatedROI.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Invested: ₹{item.invested.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ₹{item.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </p>
                          <p className={`text-sm flex items-center gap-1 ${
                            parseFloat(item.roi) >= 0 ? 'text-accent' : 'text-destructive'
                          }`}>
                            {parseFloat(item.roi) >= 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {item.roi}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
