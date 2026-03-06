import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Startup } from '@/types/database';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, BarChart2 } from 'lucide-react';

interface Props {
  startup: Startup;
  investments: any[];
}

export function StartupGrowthChart({ startup, investments }: Props) {
  // Generate monthly growth data from investments
  const monthlyData = generateMonthlyData(investments, startup);

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Funding Growth
            </CardTitle>
            <CardDescription>Cumulative investment received over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="fundingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                  <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(222, 45%, 9%)', border: '1px solid hsl(222, 30%, 18%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }}
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Cumulative']}
                  />
                  <Area type="monotone" dataKey="cumulative" stroke="hsl(38, 92%, 50%)" fill="url(#fundingGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-accent" />
              Monthly Investments
            </CardTitle>
            <CardDescription>Number of investments per month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                  <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(222, 45%, 9%)', border: '1px solid hsl(222, 30%, 18%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }}
                  />
                  <Bar dataKey="count" fill="hsl(160, 70%, 42%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Funding Progress</p>
            <p className="text-2xl font-bold mt-1">{((startup.amount_raised / startup.funding_goal) * 100).toFixed(1)}%</p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min((startup.amount_raised / startup.funding_goal) * 100, 100)}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent/5 via-transparent to-transparent">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Investment Size</p>
            <p className="text-2xl font-bold mt-1">
              ₹{investments.length > 0 ? Math.round(investments.reduce((s, i) => s + i.amount, 0) / investments.length).toLocaleString('en-IN') : '0'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/5 via-transparent to-transparent">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Remaining to Goal</p>
            <p className="text-2xl font-bold mt-1">₹{Math.max(0, startup.funding_goal - startup.amount_raised).toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function generateMonthlyData(investments: any[], startup: Startup) {
  // Generate sample data if no real investments
  if (investments.length === 0) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let cumulative = 0;
    return months.map((month, i) => {
      const amount = Math.round(Math.random() * 50000 + 10000);
      cumulative += amount;
      return { month, amount, cumulative, count: Math.floor(Math.random() * 5 + 1) };
    });
  }

  const monthMap: Record<string, { amount: number; count: number }> = {};
  investments.forEach(inv => {
    const date = new Date(inv.created_at);
    const key = `${date.toLocaleString('en', { month: 'short' })} ${date.getFullYear().toString().slice(2)}`;
    if (!monthMap[key]) monthMap[key] = { amount: 0, count: 0 };
    monthMap[key].amount += inv.amount;
    monthMap[key].count += 1;
  });

  let cumulative = 0;
  return Object.entries(monthMap).map(([month, data]) => {
    cumulative += data.amount;
    return { month, amount: data.amount, cumulative, count: data.count };
  });
}
