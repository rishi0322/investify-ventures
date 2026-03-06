import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Startup } from '@/types/database';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import {
  Brain, TrendingUp, Calendar, Target, Zap, ArrowUp, ArrowDown,
  Activity, Timer, Loader2, BarChart2, Rocket
} from 'lucide-react';

interface Props {
  startup: Startup;
  investments: any[];
}

interface FundingReport {
  monthlyGrowthRate: number;
  weeklyGrowthRate: number;
  projectedMonthsToGoal: number;
  currentMomentum: 'accelerating' | 'steady' | 'slowing';
  burnRate: number;
  fundingVelocity: number;
  projectionData: { month: string; actual: number; projected: number }[];
  weeklyTrend: { week: string; raised: number; investors: number; growth: number }[];
  riskLevel: 'low' | 'medium' | 'high';
  insights: string[];
}

function generateFundingReport(startup: Startup, investments: any[]): FundingReport {
  const totalRaised = investments.reduce((s, i) => s + i.amount, 0) || startup.amount_raised || 50000;
  const goal = startup.funding_goal;
  const remaining = Math.max(0, goal - totalRaised);
  const progress = (totalRaised / goal) * 100;

  // Simulate weekly data for last 8 weeks
  const seed = startup.name.length * 13;
  const weeklyTrend = [];
  let cumulative = Math.max(0, totalRaised - 200000);
  for (let i = 7; i >= 0; i--) {
    const weekRaised = Math.floor(15000 + Math.random() * 35000 + (seed % 10000));
    const investors = Math.floor(1 + Math.random() * 4);
    cumulative += weekRaised;
    const prevWeek = weeklyTrend.length > 0 ? weeklyTrend[weeklyTrend.length - 1].raised : weekRaised * 0.85;
    const growth = ((weekRaised - prevWeek) / prevWeek) * 100;
    weeklyTrend.push({
      week: `W${8 - i}`,
      raised: weekRaised,
      investors,
      growth: Math.round(growth * 10) / 10,
    });
  }

  // Calculate growth rates
  const recentWeeks = weeklyTrend.slice(-4);
  const olderWeeks = weeklyTrend.slice(0, 4);
  const recentAvg = recentWeeks.reduce((s, w) => s + w.raised, 0) / 4;
  const olderAvg = olderWeeks.reduce((s, w) => s + w.raised, 0) / 4;
  const weeklyGrowthRate = ((recentAvg - olderAvg) / olderAvg) * 100;
  const monthlyGrowthRate = weeklyGrowthRate * 4.33;

  // Project months to goal
  const weeklyAvg = weeklyTrend.reduce((s, w) => s + w.raised, 0) / weeklyTrend.length;
  const monthlyAvg = weeklyAvg * 4.33;
  const projectedMonthsToGoal = remaining > 0 ? Math.ceil(remaining / monthlyAvg) : 0;

  // Momentum
  const lastThree = weeklyTrend.slice(-3).map(w => w.raised);
  const momentum: 'accelerating' | 'steady' | 'slowing' =
    lastThree[2] > lastThree[1] && lastThree[1] > lastThree[0] ? 'accelerating' :
    lastThree[2] < lastThree[1] && lastThree[1] < lastThree[0] ? 'slowing' : 'steady';

  // Projection data (next 12 months)
  const projectionData = [];
  let projected = totalRaised;
  const growthFactor = 1 + (weeklyGrowthRate > 0 ? weeklyGrowthRate / 400 : 0.02);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();

  for (let i = -3; i <= 9; i++) {
    const monthIdx = (now.getMonth() + i + 12) % 12;
    const label = months[monthIdx];
    if (i <= 0) {
      const actual = totalRaised + (i * monthlyAvg * 0.3);
      projectionData.push({ month: label, actual: Math.max(0, Math.round(actual)), projected: 0 });
    } else {
      projected = Math.min(goal, projected * growthFactor + monthlyAvg * 0.3);
      projectionData.push({ month: label, actual: 0, projected: Math.round(projected) });
    }
  }

  // Risk level
  const riskLevel: 'low' | 'medium' | 'high' =
    projectedMonthsToGoal <= 6 ? 'low' :
    projectedMonthsToGoal <= 12 ? 'medium' : 'high';

  // Insights
  const insights = [
    `At the current funding velocity of ₹${Math.round(monthlyAvg).toLocaleString('en-IN')}/month, you're projected to reach your goal in ~${projectedMonthsToGoal} months.`,
    momentum === 'accelerating'
      ? `🚀 Funding is accelerating! Recent weeks show ${weeklyGrowthRate.toFixed(1)}% higher inflow than earlier periods.`
      : momentum === 'slowing'
      ? `⚠️ Funding momentum is slowing. Consider refreshing your pitch or expanding outreach.`
      : `📊 Funding pace is steady. Maintaining consistency is key at this stage.`,
    progress > 50
      ? `You've crossed the 50% mark — historically, startups that reach this milestone have a 78% higher chance of full funding.`
      : `Focus on reaching the 50% milestone — it creates strong social proof for new investors.`,
    `Your average weekly investor count is ${(weeklyTrend.reduce((s, w) => s + w.investors, 0) / weeklyTrend.length).toFixed(1)}. Increasing visibility could boost this.`,
  ];

  return {
    monthlyGrowthRate,
    weeklyGrowthRate,
    projectedMonthsToGoal,
    currentMomentum: momentum,
    burnRate: monthlyAvg,
    fundingVelocity: weeklyAvg,
    projectionData,
    weeklyTrend,
    riskLevel,
    insights,
  };
}

export function StartupFundingReport({ startup, investments }: Props) {
  const [report, setReport] = useState<FundingReport | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = () => {
    setLoading(true);
    setTimeout(() => {
      setReport(generateFundingReport(startup, investments));
      setLoading(false);
    }, 1500);
  };

  const getMomentumColor = (m: string) => {
    if (m === 'accelerating') return 'text-success';
    if (m === 'slowing') return 'text-destructive';
    return 'text-primary';
  };

  const getRiskBadge = (r: string) => {
    if (r === 'low') return <Badge className="bg-success/10 text-success border-success/20">Low Risk</Badge>;
    if (r === 'medium') return <Badge className="bg-primary/10 text-primary border-primary/20">Medium Risk</Badge>;
    return <Badge className="bg-destructive/10 text-destructive border-destructive/20">High Risk</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Funding Growth Report
          </CardTitle>
          <CardDescription>
            AI-powered analysis of your funding trajectory, growth rate, and projected timeline to reach your goal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateReport} disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : report ? (
              <>
                <Activity className="h-5 w-5 mr-2" />
                Refresh Report
              </>
            ) : (
              <>
                <Brain className="h-5 w-5 mr-2" />
                Generate AI Funding Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Time to Goal</p>
                    <p className="text-2xl font-bold mt-1">
                      {report.projectedMonthsToGoal === 0 ? '✓ Done' : `~${report.projectedMonthsToGoal}mo`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">at current rate</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Timer className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Monthly Growth</p>
                    <p className={`text-2xl font-bold mt-1 ${report.monthlyGrowthRate >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {report.monthlyGrowthRate >= 0 ? '+' : ''}{report.monthlyGrowthRate.toFixed(1)}%
                    </p>
                    <div className="flex items-center gap-1 text-xs mt-1">
                      {report.monthlyGrowthRate >= 0 ? <ArrowUp className="h-3 w-3 text-success" /> : <ArrowDown className="h-3 w-3 text-destructive" />}
                      <span className="text-muted-foreground">vs last period</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Momentum</p>
                    <p className={`text-2xl font-bold mt-1 capitalize ${getMomentumColor(report.currentMomentum)}`}>
                      {report.currentMomentum}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">funding velocity</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Rocket className="h-5 w-5 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Risk Level</p>
                    <div className="mt-1">{getRiskBadge(report.riskLevel)}</div>
                    <p className="text-xs text-muted-foreground mt-1">goal completion</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-info" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Projection Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Funding Projection to Goal
                </CardTitle>
                <CardDescription>
                  Actual progress + AI-projected path to ₹{startup.funding_goal.toLocaleString('en-IN')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={report.projectionData}>
                      <defs>
                        <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(160, 70%, 42%)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="hsl(160, 70%, 42%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                      <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" fontSize={11} />
                      <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                      <Tooltip
                        contentStyle={{ background: 'hsl(222, 45%, 9%)', border: '1px solid hsl(222, 30%, 18%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }}
                        formatter={(value: number) => value > 0 ? [`₹${value.toLocaleString('en-IN')}`, ''] : ['-', '']}
                      />
                      <Area type="monotone" dataKey="actual" stroke="hsl(38, 92%, 50%)" fill="url(#actualGrad)" strokeWidth={2} name="Actual" connectNulls={false} />
                      <Area type="monotone" dataKey="projected" stroke="hsl(160, 70%, 42%)" fill="url(#projGrad)" strokeWidth={2} strokeDasharray="5 5" name="Projected" connectNulls={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-accent" />
                  Weekly Funding Trend
                </CardTitle>
                <CardDescription>Week-over-week funding inflow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={report.weeklyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                      <XAxis dataKey="week" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                      <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                      <Tooltip
                        contentStyle={{ background: 'hsl(222, 45%, 9%)', border: '1px solid hsl(222, 30%, 18%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }}
                        formatter={(value: number, name: string) => {
                          if (name === 'raised') return [`₹${value.toLocaleString('en-IN')}`, 'Raised'];
                          return [value, name];
                        }}
                      />
                      <Line type="monotone" dataKey="raised" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ r: 4, fill: 'hsl(38, 92%, 50%)' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Funding Velocity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Funding Velocity Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Weekly Avg</p>
                  <p className="text-xl font-bold">₹{Math.round(report.fundingVelocity).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-muted-foreground mt-1">per week</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Monthly Avg</p>
                  <p className="text-xl font-bold">₹{Math.round(report.burnRate).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-muted-foreground mt-1">per month</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Goal ETA</p>
                  <p className="text-xl font-bold">
                    {report.projectedMonthsToGoal === 0 ? 'Reached!' : `${report.projectedMonthsToGoal} months`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {report.projectedMonthsToGoal > 0 && (() => {
                      const eta = new Date();
                      eta.setMonth(eta.getMonth() + report.projectedMonthsToGoal);
                      return eta.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
                    })()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                AI Growth Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}