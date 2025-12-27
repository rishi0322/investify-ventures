import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Investment, Startup, SECTOR_LABELS, SECTOR_ICONS } from '@/types/database';

interface PortfolioChartsProps {
  investments: (Investment & { startup: Startup })[];
  simulatedValues: Record<string, number>;
}

const COLORS = [
  'hsl(38, 92%, 50%)',   // Gold
  'hsl(160, 70%, 42%)',  // Accent green
  'hsl(199, 89%, 48%)',  // Info blue
  'hsl(280, 70%, 55%)',  // Purple
  'hsl(340, 75%, 55%)',  // Pink
  'hsl(45, 100%, 60%)',  // Light gold
  'hsl(180, 75%, 40%)',  // Teal
  'hsl(220, 70%, 55%)',  // Blue
];

export function PortfolioCharts({ investments, simulatedValues }: PortfolioChartsProps) {
  // Sector allocation data
  const sectorData = investments.reduce((acc, inv) => {
    const sector = inv.startup?.sector || 'technology';
    const existing = acc.find(d => d.sector === sector);
    if (existing) {
      existing.value += inv.amount;
    } else {
      acc.push({ 
        sector, 
        label: SECTOR_LABELS[sector], 
        icon: SECTOR_ICONS[sector],
        value: inv.amount 
      });
    }
    return acc;
  }, [] as { sector: string; label: string; icon: string; value: number }[]);

  // Performance timeline (simulated)
  const today = new Date();
  const performanceData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    
    // Calculate portfolio value for this day
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const dayMultiplier = 1 + (Math.random() - 0.45) * 0.08 * (i + 1) / 7; // Trending upward
    
    return {
      date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      value: totalInvested * dayMultiplier
    };
  });

  // Add current value as the last point
  const currentTotal = Object.values(simulatedValues).reduce((sum, val) => sum + val, 0);
  if (performanceData.length > 0 && currentTotal > 0) {
    performanceData[performanceData.length - 1].value = currentTotal;
  }

  const chartConfig = {
    value: { label: 'Portfolio Value', color: 'hsl(38, 92%, 50%)' }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Sector Allocation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Sector Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          {sectorData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              No investments yet
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="hsl(222, 45%, 9%)"
                    >
                      {sectorData.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {sectorData.slice(0, 5).map((item, index) => {
                  const total = sectorData.reduce((sum, d) => sum + d.value, 0);
                  const percentage = ((item.value / total) * 100).toFixed(1);
                  return (
                    <div key={item.sector} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-muted-foreground">{item.icon} {item.label}</span>
                      </div>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                  );
                })}
                {sectorData.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    +{sectorData.length - 5} more sectors
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">7-Day Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              No investments yet
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-48 w-full">
              <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }}
                />
                <YAxis 
                  hide
                  domain={['dataMin - 5000', 'dataMax + 5000']}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(38, 92%, 50%)"
                  strokeWidth={2}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
