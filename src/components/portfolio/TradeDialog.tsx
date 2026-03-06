import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Investment, Startup, SECTOR_LABELS } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, ArrowRightLeft, AlertTriangle } from 'lucide-react';

interface TradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investment: (Investment & { startup: Startup }) | null;
  simulatedChange: number;
  onTradeComplete: (investmentId: string, action: 'sell' | 'buy', amount: number, pnl: number) => void;
}

export function TradeDialog({ open, onOpenChange, investment, simulatedChange, onTradeComplete }: TradeDialogProps) {
  const { toast } = useToast();
  const [tradeType, setTradeType] = useState<'sell' | 'buy'>('sell');
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!investment) return null;

  const currentValue = investment.amount * (1 + simulatedChange / 100);
  const pricePerShare = (investment.startup?.valuation || 10000000) / (investment.startup?.total_shares || 1000000);
  const currentPricePerShare = pricePerShare * (1 + simulatedChange / 100);
  const sharesOwned = Math.floor((investment.amount / (investment.startup?.valuation || 10000000)) * (investment.startup?.total_shares || 1000000));
  const tradeAmount = parseFloat(amount) || 0;
  const sharesToTrade = Math.floor(tradeAmount / currentPricePerShare);
  const isPositive = simulatedChange >= 0;

  const pnl = tradeType === 'sell'
    ? tradeAmount - (sharesToTrade * pricePerShare) // profit/loss on sale
    : 0;

  const maxSellAmount = currentValue;
  const isValid = tradeAmount > 0 && (tradeType === 'buy' || tradeAmount <= maxSellAmount);

  const executeTrade = () => {
    if (!isValid) return;
    setProcessing(true);
    setTimeout(() => {
      onTradeComplete(investment.id, tradeType, tradeAmount, pnl);
      toast({
        title: tradeType === 'sell' ? '📉 Shares Sold' : '📈 Shares Bought',
        description: `${tradeType === 'sell' ? 'Sold' : 'Bought'} ${sharesToTrade} shares of ${investment.startup?.name} for ₹${tradeAmount.toLocaleString('en-IN')}${tradeType === 'sell' ? `. P&L: ${pnl >= 0 ? '+' : ''}₹${pnl.toFixed(0)}` : ''}`,
      });
      setAmount('');
      setProcessing(false);
      onOpenChange(false);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Trade {investment.startup?.name}
          </DialogTitle>
          <DialogDescription>
            Execute a buy or sell order at current market price
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Price Card */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Current Price/Share</span>
              <span className="text-lg font-bold">₹{currentPricePerShare.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Market Change</span>
              <span className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {isPositive ? '+' : ''}{simulatedChange.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">Your Holdings</span>
              <span className="text-sm font-medium">{sharesOwned.toLocaleString()} shares (₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })})</span>
            </div>
          </div>

          {/* Trade Type Toggle */}
          <div className="flex gap-2">
            <Button
              variant={tradeType === 'buy' ? 'default' : 'outline'}
              className={`flex-1 ${tradeType === 'buy' ? 'bg-success hover:bg-success/90 text-success-foreground' : ''}`}
              onClick={() => setTradeType('buy')}
            >
              <TrendingUp className="h-4 w-4 mr-1" /> Buy
            </Button>
            <Button
              variant={tradeType === 'sell' ? 'default' : 'outline'}
              className={`flex-1 ${tradeType === 'sell' ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : ''}`}
              onClick={() => setTradeType('sell')}
            >
              <TrendingDown className="h-4 w-4 mr-1" /> Sell
            </Button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Amount (₹)</label>
            <Input
              type="number"
              placeholder="Enter amount..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {tradeType === 'sell' && (
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-muted-foreground">Max: ₹{maxSellAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setAmount(maxSellAmount.toFixed(0))}>
                  Sell All
                </Button>
              </div>
            )}
          </div>

          {/* Trade Summary */}
          {tradeAmount > 0 && (
            <div className="p-3 rounded-lg bg-muted/20 border border-border/50 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shares</span>
                <span className="font-medium">{sharesToTrade.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price/Share</span>
                <span className="font-medium">₹{currentPricePerShare.toFixed(2)}</span>
              </div>
              {tradeType === 'sell' && (
                <div className="flex justify-between text-sm pt-1.5 border-t border-border/50">
                  <span className="text-muted-foreground">Est. P&L</span>
                  <span className={`font-bold ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(0)}
                  </span>
                </div>
              )}
            </div>
          )}

          {tradeType === 'sell' && tradeAmount > maxSellAmount && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              Amount exceeds your holdings
            </div>
          )}

          <Button
            onClick={executeTrade}
            disabled={!isValid || processing}
            className={`w-full ${tradeType === 'sell' ? 'bg-destructive hover:bg-destructive/90' : 'bg-success hover:bg-success/90'}`}
          >
            {processing ? 'Executing...' : `${tradeType === 'sell' ? 'Sell' : 'Buy'} ${sharesToTrade > 0 ? `${sharesToTrade} shares` : ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}