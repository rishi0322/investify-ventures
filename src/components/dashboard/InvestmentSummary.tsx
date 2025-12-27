import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { Investment, Startup, SECTOR_LABELS } from '@/types/database';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  PieChart,
  BarChart3,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend 
} from 'recharts';

interface InvestmentSummaryProps {
  investments: (Investment & { startup: Startup })[];
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

// Sample P&L data (in a real app, this would come from actual price changes)
const generatePnL = (investment: Investment) => {
  // Simulate random P&L between -20% and +40%
  const seed = investment.id.charCodeAt(0) + investment.id.charCodeAt(1);
  const changePercent = ((seed % 60) - 20); // -20% to +40%
  return {
    originalAmount: investment.amount,
    currentValue: investment.amount * (1 + changePercent / 100),
    changePercent,
    pnl: investment.amount * (changePercent / 100)
  };
};

export function InvestmentSummary({ investments }: InvestmentSummaryProps) {
  const summaryData = useMemo(() => {
    const investmentsWithPnL = investments.map(inv => ({
      ...inv,
      pnlData: generatePnL(inv)
    }));

    const totalInvested = investmentsWithPnL.reduce((sum, inv) => sum + inv.pnlData.originalAmount, 0);
    const currentValue = investmentsWithPnL.reduce((sum, inv) => sum + inv.pnlData.currentValue, 0);
    const totalPnL = currentValue - totalInvested;
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    const winners = investmentsWithPnL.filter(inv => inv.pnlData.changePercent > 0);
    const losers = investmentsWithPnL.filter(inv => inv.pnlData.changePercent < 0);
    const neutral = investmentsWithPnL.filter(inv => inv.pnlData.changePercent === 0);

    // Sector allocation
    const sectorAllocation = investmentsWithPnL.reduce((acc, inv) => {
      const sector = inv.startup?.sector || 'unknown';
      if (!acc[sector]) {
        acc[sector] = { value: 0, count: 0 };
      }
      acc[sector].value += inv.pnlData.currentValue;
      acc[sector].count += 1;
      return acc;
    }, {} as Record<string, { value: number; count: number }>);

    const sectorChartData = Object.entries(sectorAllocation).map(([sector, data]) => ({
      name: SECTOR_LABELS[sector as keyof typeof SECTOR_LABELS] || sector,
      value: data.value,
      count: data.count
    }));

    return {
      totalInvested,
      currentValue,
      totalPnL,
      totalPnLPercent,
      winners,
      losers,
      neutral,
      investmentsWithPnL,
      sectorChartData
    };
  }, [investments]);

  if (investments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <PieChart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Investments Yet</h3>
          <p className="text-muted-foreground mb-4">Start investing to see your portfolio summary</p>
          <Link to="/startups" className="text-primary hover:underline">
            Browse Startups →
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Invested</p>
            <p className="text-2xl font-bold">₹{summaryData.totalInvested.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Current Value</p>
            <p className="text-2xl font-bold">₹{summaryData.currentValue.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        <Card className={summaryData.totalPnL >= 0 ? 'border-success/30' : 'border-destructive/30'}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total P&L</p>
            <p className={`text-2xl font-bold flex items-center gap-2 ${summaryData.totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              {summaryData.totalPnL >= 0 ? '+' : ''}₹{summaryData.totalPnL.toLocaleString('en-IN')}
              {summaryData.totalPnL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            </p>
            <p className={`text-sm ${summaryData.totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              {summaryData.totalPnL >= 0 ? '+' : ''}{summaryData.totalPnLPercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Win/Loss Ratio</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-success border-success/30">
                {summaryData.winners.length} ↑
              </Badge>
              <Badge variant="outline" className="text-destructive border-destructive/30">
                {summaryData.losers.length} ↓
              </Badge>
            </div>
            <Progress 
              value={(summaryData.winners.length / investments.length) * 100} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sector Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-primary" />
              Sector Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={summaryData.sectorChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {summaryData.sectorChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Value']}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Individual Investments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Investment Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {summaryData.investmentsWithPnL
                .sort((a, b) => b.pnlData.changePercent - a.pnlData.changePercent)
                .map((inv) => (
                <Link
                  key={inv.id}
                  to={`/startups/${inv.startup_id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      inv.pnlData.changePercent > 0 
                        ? 'bg-success/10' 
                        : inv.pnlData.changePercent < 0 
                        ? 'bg-destructive/10' 
                        : 'bg-muted'
                    }`}>
                      {inv.pnlData.changePercent > 0 && <TrendingUp className="h-4 w-4 text-success" />}
                      {inv.pnlData.changePercent < 0 && <TrendingDown className="h-4 w-4 text-destructive" />}
                      {inv.pnlData.changePercent === 0 && <Minus className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{inv.startup?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        Invested: ₹{inv.amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${
                      inv.pnlData.changePercent > 0 
                        ? 'text-success' 
                        : inv.pnlData.changePercent < 0 
                        ? 'text-destructive' 
                        : ''
                    }`}>
                      {inv.pnlData.changePercent > 0 ? '+' : ''}{inv.pnlData.changePercent.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {inv.pnlData.pnl >= 0 ? '+' : ''}₹{inv.pnlData.pnl.toLocaleString('en-IN')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Investments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Recent Investments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {investments.slice(0, 5).map((inv) => (
              <Link
                key={inv.id}
                to={`/startups/${inv.startup_id}`}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {inv.startup?.logo_url ? (
                      <img src={inv.startup.logo_url} alt={inv.startup.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-lg">💼</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{inv.startup?.name || 'Unknown Startup'}</p>
                    <p className="text-xs text-muted-foreground">
                      {SECTOR_LABELS[inv.startup?.sector as keyof typeof SECTOR_LABELS] || inv.startup?.sector}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{inv.amount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(inv.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
