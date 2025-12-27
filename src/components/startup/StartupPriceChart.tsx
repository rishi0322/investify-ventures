import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';

interface StartupPriceChartProps {
  startupName: string;
  valuation: number;
  minInvestment: number;
}

// Generate sample price data
const generatePriceData = (basePrice: number, volatility: number = 0.05) => {
  const periods = ['1D', '1W', '1M', '3M', '6M', '1Y'];
  const dataPoints: Record<string, { time: string; price: number; volume: number }[]> = {};

  periods.forEach((period) => {
    const points: { time: string; price: number; volume: number }[] = [];
    let currentPrice = basePrice * (0.7 + Math.random() * 0.3); // Start 70-100% of base
    
    let numPoints = 24;
    if (period === '1W') numPoints = 7;
    if (period === '1M') numPoints = 30;
    if (period === '3M') numPoints = 90;
    if (period === '6M') numPoints = 180;
    if (period === '1Y') numPoints = 365;

    // Sample every nth point for display
    const sampleRate = Math.max(1, Math.floor(numPoints / 30));
    
    for (let i = 0; i < numPoints; i += sampleRate) {
      const change = (Math.random() - 0.45) * volatility; // Slight upward bias
      currentPrice = currentPrice * (1 + change);
      currentPrice = Math.max(currentPrice, basePrice * 0.3); // Floor at 30% of base
      
      let timeLabel = '';
      if (period === '1D') timeLabel = `${(i % 24).toString().padStart(2, '0')}:00`;
      else if (period === '1W') timeLabel = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i % 7];
      else timeLabel = `Day ${i + 1}`;

      points.push({
        time: timeLabel,
        price: Math.round(currentPrice * 100) / 100,
        volume: Math.round(Math.random() * 100000)
      });
    }

    // End near the base price for consistency
    if (points.length > 0) {
      points[points.length - 1].price = basePrice;
    }

    dataPoints[period] = points;
  });

  return dataPoints;
};

export function StartupPriceChart({ startupName, valuation, minInvestment }: StartupPriceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  
  // Calculate share price (valuation / 1M shares)
  const sharePrice = valuation / 1000000;
  const priceData = generatePriceData(sharePrice);
  
  const currentData = priceData[selectedPeriod] || [];
  const firstPrice = currentData[0]?.price || sharePrice;
  const lastPrice = currentData[currentData.length - 1]?.price || sharePrice;
  const priceChange = lastPrice - firstPrice;
  const percentChange = ((priceChange / firstPrice) * 100).toFixed(2);
  const isPositive = priceChange >= 0;

  const highPrice = Math.max(...currentData.map(d => d.price));
  const lowPrice = Math.min(...currentData.map(d => d.price));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              {startupName} Price Movement
            </CardTitle>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-2xl font-bold">₹{lastPrice.toFixed(2)}</span>
              <Badge 
                variant="secondary" 
                className={isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}
              >
                {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {isPositive ? '+' : ''}{percentChange}%
              </Badge>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="flex gap-4">
              <div>
                <p className="text-muted-foreground">High</p>
                <p className="font-medium text-success">₹{highPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Low</p>
                <p className="font-medium text-destructive">₹{lowPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Period Selector */}
        <div className="flex gap-2 mb-4">
          {['1D', '1W', '1M', '3M', '6M', '1Y'].map((period) => (
            <Button
              key={period}
              size="sm"
              variant={selectedPeriod === period ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod(period)}
              className="text-xs"
            >
              {period}
            </Button>
          ))}
        </div>

        {/* Price Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id={`priceGradient-${startupName}`} x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                    stopOpacity={0.3}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `₹${value.toFixed(0)}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Price']}
              />
              <ReferenceLine 
                y={sharePrice} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5" 
                label={{ value: 'Current', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Market Cap</p>
            <p className="text-sm font-medium">₹{(valuation / 10000000).toFixed(1)}Cr</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Min Investment</p>
            <p className="text-sm font-medium">₹{minInvestment.toLocaleString('en-IN')}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Avg Volume</p>
            <p className="text-sm font-medium">{(Math.random() * 50000 + 10000).toFixed(0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Volatility</p>
            <p className="text-sm font-medium">{(Math.random() * 20 + 10).toFixed(1)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
