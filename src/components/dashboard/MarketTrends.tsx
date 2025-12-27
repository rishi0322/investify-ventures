import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  ShoppingCart, 
  BarChart2,
  Zap,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

// Sample trending startups data
const trendingData = {
  bullish: [
    { id: '1', name: 'QuantumAI Labs', sector: 'technology', change: 24.5, sentiment: 'Very Bullish', volume: 1250 },
    { id: '2', name: 'GreenEnergy Co', sector: 'green_energy', change: 18.2, sentiment: 'Bullish', volume: 890 },
    { id: '3', name: 'HealthTech Pro', sector: 'healthcare', change: 15.8, sentiment: 'Bullish', volume: 720 },
    { id: '4', name: 'FinFlow', sector: 'fintech', change: 12.4, sentiment: 'Moderately Bullish', volume: 650 },
  ],
  bearish: [
    { id: '5', name: 'Legacy Systems', sector: 'technology', change: -15.2, sentiment: 'Bearish', volume: 420 },
    { id: '6', name: 'OldRetail Inc', sector: 'ecommerce', change: -12.8, sentiment: 'Bearish', volume: 380 },
    { id: '7', name: 'TradMedia', sector: 'media_entertainment', change: -8.5, sentiment: 'Moderately Bearish', volume: 290 },
  ],
  mostBought: [
    { id: '1', name: 'QuantumAI Labs', sector: 'technology', buyers: 342, totalInvested: 25000000 },
    { id: '8', name: 'EduNext', sector: 'edtech', buyers: 287, totalInvested: 18500000 },
    { id: '2', name: 'GreenEnergy Co', sector: 'green_energy', buyers: 256, totalInvested: 22000000 },
    { id: '9', name: 'AgriTech Solutions', sector: 'agriculture', buyers: 198, totalInvested: 12000000 },
  ],
  mostSold: [
    { id: '5', name: 'Legacy Systems', sector: 'technology', sellers: 156, totalSold: 8500000 },
    { id: '6', name: 'OldRetail Inc', sector: 'ecommerce', sellers: 134, totalSold: 6200000 },
    { id: '10', name: 'RealEstate Old', sector: 'real_estate', sellers: 98, totalSold: 4800000 },
  ],
  breakout: [
    { id: '11', name: 'NeuralLink AI', sector: 'technology', breakoutScore: 95, momentum: 'Strong Upward', volume: 2100 },
    { id: '12', name: 'SolarMax', sector: 'green_energy', breakoutScore: 88, momentum: 'Upward', volume: 1450 },
    { id: '13', name: 'CryptoPayments', sector: 'fintech', breakoutScore: 82, momentum: 'Upward', volume: 1200 },
  ],
  inDemand: [
    { id: '1', name: 'QuantumAI Labs', sector: 'technology', demandScore: 98, waitlist: 1520 },
    { id: '11', name: 'NeuralLink AI', sector: 'technology', demandScore: 94, waitlist: 1280 },
    { id: '14', name: 'BioGenetics', sector: 'healthcare', demandScore: 89, waitlist: 890 },
    { id: '12', name: 'SolarMax', sector: 'green_energy', demandScore: 85, waitlist: 720 },
  ]
};

export function MarketTrends() {
  const [activeTab, setActiveTab] = useState('bullish');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary" />
          Market Trends & Recommendations
          <Badge variant="secondary" className="ml-2">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 mb-4">
            <TabsTrigger value="bullish" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Bullish
            </TabsTrigger>
            <TabsTrigger value="bearish" className="text-xs">
              <TrendingDown className="h-3 w-3 mr-1" />
              Bearish
            </TabsTrigger>
            <TabsTrigger value="mostBought" className="text-xs">
              <ShoppingCart className="h-3 w-3 mr-1" />
              Most Bought
            </TabsTrigger>
            <TabsTrigger value="mostSold" className="text-xs">
              <BarChart2 className="h-3 w-3 mr-1" />
              Most Sold
            </TabsTrigger>
            <TabsTrigger value="breakout" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Breakout
            </TabsTrigger>
            <TabsTrigger value="inDemand" className="text-xs">
              <Flame className="h-3 w-3 mr-1" />
              In Demand
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bullish" className="space-y-3">
            {trendingData.bullish.map((startup) => (
              <Link
                key={startup.id}
                to={`/startups/${startup.id}`}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">{startup.name}</p>
                    <p className="text-xs text-muted-foreground">{startup.volume} investors this week</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-success font-semibold">+{startup.change}%</p>
                  <Badge variant="outline" className="text-success border-success/30">
                    {startup.sentiment}
                  </Badge>
                </div>
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="bearish" className="space-y-3">
            {trendingData.bearish.map((startup) => (
              <Link
                key={startup.id}
                to={`/startups/${startup.id}`}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium">{startup.name}</p>
                    <p className="text-xs text-muted-foreground">{startup.volume} sells this week</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-destructive font-semibold">{startup.change}%</p>
                  <Badge variant="outline" className="text-destructive border-destructive/30">
                    {startup.sentiment}
                  </Badge>
                </div>
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="mostBought" className="space-y-3">
            {trendingData.mostBought.map((startup, index) => (
              <Link
                key={startup.id}
                to={`/startups/${startup.id}`}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{startup.name}</p>
                    <p className="text-xs text-muted-foreground">{startup.buyers} buyers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{(startup.totalInvested / 10000000).toFixed(1)}Cr</p>
                  <p className="text-xs text-muted-foreground">Total invested</p>
                </div>
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="mostSold" className="space-y-3">
            {trendingData.mostSold.map((startup, index) => (
              <Link
                key={startup.id}
                to={`/startups/${startup.id}`}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center font-bold text-warning">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{startup.name}</p>
                    <p className="text-xs text-muted-foreground">{startup.sellers} sellers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-destructive">₹{(startup.totalSold / 10000000).toFixed(1)}Cr</p>
                  <p className="text-xs text-muted-foreground">Total sold</p>
                </div>
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="breakout" className="space-y-3">
            {trendingData.breakout.map((startup) => (
              <Link
                key={startup.id}
                to={`/startups/${startup.id}`}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">{startup.name}</p>
                    <p className="text-xs text-muted-foreground">{startup.volume} volume surge</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-accent">{startup.breakoutScore}/100</p>
                  <Badge variant="secondary">{startup.momentum}</Badge>
                </div>
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="inDemand" className="space-y-3">
            {trendingData.inDemand.map((startup) => (
              <Link
                key={startup.id}
                to={`/startups/${startup.id}`}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Flame className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium">{startup.name}</p>
                    <p className="text-xs text-muted-foreground">{startup.waitlist} on waitlist</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-500">{startup.demandScore}%</p>
                  <p className="text-xs text-muted-foreground">Demand Score</p>
                </div>
              </Link>
            ))}
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-4 border-t">
          <Button asChild className="w-full">
            <Link to="/startups">
              View All Startups
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
