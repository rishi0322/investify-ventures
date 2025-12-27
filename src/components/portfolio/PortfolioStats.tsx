import { Card, CardContent } from '@/components/ui/card';
import { 
  Wallet, 
  TrendingUp, 
  Building2, 
  PieChart,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface PortfolioStatsProps {
  totalInvested: number;
  currentValue: number;
  totalCompanies: number;
  totalEquity: number;
}

export function PortfolioStats({ 
  totalInvested, 
  currentValue, 
  totalCompanies,
  totalEquity 
}: PortfolioStatsProps) {
  const totalReturn = currentValue - totalInvested;
  const returnPercentage = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;
  const isPositive = totalReturn >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Invested</p>
              <p className="text-xl font-display font-bold">
                ₹{totalInvested.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`border-${isPositive ? 'success' : 'destructive'}/20 bg-gradient-to-br from-${isPositive ? 'success' : 'destructive'}/10 to-transparent`}>
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl ${isPositive ? 'gradient-accent' : 'bg-destructive'} flex items-center justify-center`}>
              {isPositive ? (
                <TrendingUp className="h-5 w-5 text-accent-foreground" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive-foreground" />
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Portfolio Value</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-display font-bold">
                  ₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
                <span className={`text-xs font-medium flex items-center ${isPositive ? 'text-success' : 'text-destructive'}`}>
                  {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {isPositive ? '+' : ''}{returnPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-info/20 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Companies</p>
              <p className="text-xl font-display font-bold">{totalCompanies}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center">
              <PieChart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Equity</p>
              <p className="text-xl font-display font-bold">{totalEquity.toFixed(3)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
