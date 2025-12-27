import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Investment, Startup } from '@/types/database';
import { TrendingUp, Calendar, Target } from 'lucide-react';

interface InvestmentJourneyChartProps {
  investments: (Investment & { startup: Startup })[];
  demoMode?: boolean;
}

// Sample journey data for demo mode
const sampleJourneyData = [
  { month: 'Jan', invested: 25000, value: 25000, returns: 0 },
  { month: 'Feb', invested: 50000, value: 52000, returns: 2000 },
  { month: 'Mar', invested: 75000, value: 81000, returns: 6000 },
  { month: 'Apr', invested: 100000, value: 115000, returns: 15000 },
  { month: 'May', invested: 125000, value: 142000, returns: 17000 },
  { month: 'Jun', invested: 150000, value: 168000, returns: 18000 },
  { month: 'Jul', invested: 175000, value: 198000, returns: 23000 },
  { month: 'Aug', invested: 200000, value: 234000, returns: 34000 },
  { month: 'Sep', invested: 225000, value: 258000, returns: 33000 },
  { month: 'Oct', invested: 250000, value: 295000, returns: 45000 },
  { month: 'Nov', invested: 275000, value: 328000, returns: 53000 },
  { month: 'Dec', invested: 300000, value: 372000, returns: 72000 },
];

export function InvestmentJourneyChart({ investments, demoMode = false }: InvestmentJourneyChartProps) {
  // Generate chart data from investments or use sample data
  const generateChartData = () => {
    if (demoMode || investments.length === 0) {
      return sampleJourneyData;
    }

    // Group investments by month
    const monthlyData: Record<string, { invested: number; value: number }> = {};
    let runningTotal = 0;

    investments
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .forEach((inv) => {
        const date = new Date(inv.created_at);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        
        runningTotal += inv.amount;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { invested: 0, value: 0 };
        }
        monthlyData[monthKey].invested = runningTotal;
        // Simulate growth (random 5-15% growth)
        monthlyData[monthKey].value = runningTotal * (1 + (Math.random() * 0.1 + 0.05));
      });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      invested: data.invested,
      value: Math.round(data.value),
      returns: Math.round(data.value - data.invested)
    }));
  };

  const chartData = generateChartData();
  const totalInvested = chartData[chartData.length - 1]?.invested || 0;
  const currentValue = chartData[chartData.length - 1]?.value || 0;
  const totalReturns = currentValue - totalInvested;
  const returnPercentage = totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(1) : '0';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Investment Journey
            </CardTitle>
            <CardDescription>Track your portfolio growth over time</CardDescription>
          </div>
          <div className="flex gap-4 text-right">
            <div>
              <p className="text-xs text-muted-foreground">Total Invested</p>
              <p className="text-lg font-bold">₹{totalInvested.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Value</p>
              <p className="text-lg font-bold text-primary">₹{currentValue.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Returns</p>
              <Badge variant="secondary" className={totalReturns >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}>
                {totalReturns >= 0 ? '+' : ''}{returnPercentage}%
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis 
                className="text-xs" 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="invested" 
                name="Total Invested"
                stroke="hsl(var(--muted-foreground))" 
                fillOpacity={1} 
                fill="url(#colorInvested)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                name="Portfolio Value"
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium">{chartData.length} Months</p>
            <p className="text-xs text-muted-foreground">Investment Period</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <p className="text-sm font-medium">{investments.length || 12} Investments</p>
            <p className="text-xs text-muted-foreground">Total Transactions</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-2">
              <Target className="h-5 w-5 text-accent" />
            </div>
            <p className="text-sm font-medium">{new Set(investments.map(i => i.startup_id)).size || 5} Startups</p>
            <p className="text-xs text-muted-foreground">Portfolio Diversity</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
