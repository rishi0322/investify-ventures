import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, ExternalLink, PieChart, Coins, ArrowRightLeft } from 'lucide-react';
import { Investment, Startup, SECTOR_LABELS, SECTOR_ICONS } from '@/types/database';

interface PortfolioCardProps {
  investment: Investment & { startup: Startup };
  simulatedChange?: number;
  onTrade?: (investment: Investment & { startup: Startup }) => void;
}

export function PortfolioCard({ investment, simulatedChange, onTrade }: PortfolioCardProps) {
  const [currentValue, setCurrentValue] = useState(investment.amount);
  const [percentChange, setPercentChange] = useState(simulatedChange || 0);

  const valuation = investment.startup?.valuation || 10000000;
  const totalShares = investment.startup?.total_shares || 1000000;
  const equityPercentage = (investment.amount / valuation) * 100;
  const sharesOwned = Math.floor((investment.amount / valuation) * totalShares);
  
  // Simulate real-time value changes
  useEffect(() => {
    const changePercent = simulatedChange ?? (Math.random() - 0.4) * 20; // -8% to +12% bias positive
    setPercentChange(changePercent);
    setCurrentValue(investment.amount * (1 + changePercent / 100));
  }, [investment.amount, simulatedChange]);

  const gainLoss = currentValue - investment.amount;
  const isPositive = gainLoss > 0;
  const isNeutral = Math.abs(gainLoss) < 1;

  return (
    <Card className="hover:border-primary/30 transition-all duration-300 group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Startup Info */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0 group-hover:ring-2 ring-primary/30 transition-all">
              {investment.startup?.logo_url ? (
                <img 
                  src={investment.startup.logo_url} 
                  alt={investment.startup?.name} 
                  className="h-full w-full object-cover rounded-xl"
                />
              ) : (
                SECTOR_ICONS[investment.startup?.sector || 'technology']
              )}
            </div>
            <div className="min-w-0">
              <Link 
                to={`/startups/${investment.startup_id}`}
                className="font-semibold text-lg truncate block hover:text-primary transition-colors flex items-center gap-1"
              >
                {investment.startup?.name}
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {SECTOR_LABELS[investment.startup?.sector || 'technology']}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(investment.created_at).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Value & Change */}
          <div className="text-right shrink-0">
            <p className="text-xl font-bold">₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <div className={`flex items-center justify-end gap-1 text-sm ${
              isNeutral ? 'text-muted-foreground' : isPositive ? 'text-success' : 'text-destructive'
            }`}>
              {isNeutral ? (
                <Minus className="h-4 w-4" />
              ) : isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-medium">
                {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Equity Details */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Equity Stake</span>
            <span className="text-sm font-semibold text-primary">{equityPercentage.toFixed(4)}%</span>
          </div>
          <Progress value={Math.min(equityPercentage * 10, 100)} className="h-1.5 mb-3" />
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Invested</p>
              <p className="font-semibold text-sm">₹{investment.amount.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Shares</p>
              <p className="font-semibold text-sm flex items-center justify-center gap-1">
                <Coins className="h-3 w-3" />
                {sharesOwned.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Gain/Loss</p>
              <p className={`font-semibold text-sm ${
                isNeutral ? 'text-muted-foreground' : isPositive ? 'text-success' : 'text-destructive'
              }`}>
                {isPositive ? '+' : ''}₹{gainLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Trade Button */}
          {onTrade && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onTrade(investment)}
              >
                <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" />
                Trade
              </Button>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
