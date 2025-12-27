import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PieChart, Coins, TrendingUp } from 'lucide-react';

interface EquityDisplayProps {
  investmentAmount: number;
  valuation: number;
  totalShares?: number;
  compact?: boolean;
}

export function EquityDisplay({ 
  investmentAmount, 
  valuation, 
  totalShares = 1000000,
  compact = false 
}: EquityDisplayProps) {
  const equityPercentage = (investmentAmount / valuation) * 100;
  const sharesAcquired = Math.floor((investmentAmount / valuation) * totalShares);
  const pricePerShare = valuation / totalShares;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Badge variant="secondary" className="bg-accent/10 text-accent">
          <PieChart className="h-3 w-3 mr-1" />
          {equityPercentage.toFixed(4)}% equity
        </Badge>
        <Badge variant="outline">
          <Coins className="h-3 w-3 mr-1" />
          {sharesAcquired.toLocaleString('en-IN')} shares
        </Badge>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-card border border-border space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2">
          <PieChart className="h-4 w-4 text-primary" />
          Your Equity Stake
        </h4>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {equityPercentage.toFixed(4)}%
        </Badge>
      </div>

      <Progress value={equityPercentage} className="h-2" />

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-muted-foreground">Shares</p>
          <p className="font-bold">{sharesAcquired.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Price/Share</p>
          <p className="font-bold">₹{pricePerShare.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Valuation</p>
          <p className="font-bold">₹{(valuation / 10000000).toFixed(1)}Cr</p>
        </div>
      </div>
    </div>
  );
}

interface InvestmentSummaryProps {
  amount: number;
  valuation: number;
  startupName: string;
}

export function InvestmentSummary({ amount, valuation, startupName }: InvestmentSummaryProps) {
  const equityPercentage = (amount / valuation) * 100;
  const totalShares = 1000000;
  const sharesAcquired = Math.floor((amount / valuation) * totalShares);
  const pricePerShare = valuation / totalShares;

  return (
    <div className="space-y-4 p-4 rounded-lg bg-accent/5 border border-accent/20">
      <h4 className="font-semibold text-accent flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        Investment Summary
      </h4>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Investment Amount</span>
          <span className="font-semibold">₹{amount.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Company Valuation</span>
          <span className="font-semibold">₹{(valuation / 10000000).toFixed(1)} Cr</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Price per Share</span>
          <span className="font-semibold">₹{pricePerShare.toFixed(2)}</span>
        </div>
        <hr className="border-border" />
        <div className="flex justify-between text-base">
          <span className="text-muted-foreground">Shares You'll Own</span>
          <span className="font-bold text-accent">{sharesAcquired.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-base">
          <span className="text-muted-foreground">Equity Stake in {startupName}</span>
          <span className="font-bold text-accent">{equityPercentage.toFixed(4)}%</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        You will receive {sharesAcquired.toLocaleString('en-IN')} shares of {startupName} at ₹{pricePerShare.toFixed(2)} per share, 
        giving you {equityPercentage.toFixed(4)}% ownership in the company.
      </p>
    </div>
  );
}