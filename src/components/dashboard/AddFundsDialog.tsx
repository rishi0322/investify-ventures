import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  AlertCircle, 
  Loader2,
  ArrowDownToLine,
  Bitcoin
} from 'lucide-react';

interface AddFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  walletId: string;
  currentBalance: number;
  requiredAmount: number;
  onSuccess: () => void;
}

export function AddFundsDialog({ 
  open, 
  onOpenChange, 
  userId, 
  walletId, 
  currentBalance, 
  requiredAmount,
  onSuccess 
}: AddFundsDialogProps) {
  const { toast } = useToast();
  const [depositAmount, setDepositAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const shortfall = requiredAmount - currentBalance;
  const suggestedDeposit = Math.ceil(shortfall * 100) / 100; // Round up to 2 decimals

  const handleDeposit = async (amount: number) => {
    if (amount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid amount' });
      return;
    }

    setProcessing(true);

    // Simulate blockchain confirmation
    await new Promise(resolve => setTimeout(resolve, 1500));

    const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

    // Create transaction record
    await supabase.from('blockchain_transactions').insert({
      user_id: userId,
      transaction_type: 'deposit',
      amount,
      crypto_currency: 'ETH',
      transaction_hash: txHash,
      status: 'confirmed',
      confirmed_at: new Date().toISOString()
    });

    // Update wallet balance
    await supabase
      .from('user_wallets')
      .update({ balance: currentBalance + amount })
      .eq('id', walletId);

    toast({ 
      title: 'Funds added successfully!', 
      description: `${amount} ETH has been added to your wallet.` 
    });

    setProcessing(false);
    onOpenChange(false);
    onSuccess();
  };

  const handleCustomDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount)) {
      toast({ variant: 'destructive', title: 'Please enter a valid amount' });
      return;
    }
    handleDeposit(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Insufficient Balance
          </DialogTitle>
          <DialogDescription>
            Your wallet balance is too low to complete this investment. Add funds to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Balance Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
              <p className="text-lg font-semibold flex items-center gap-1">
                <Bitcoin className="h-4 w-4 text-primary" />
                {currentBalance.toFixed(4)} ETH
              </p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10">
              <p className="text-xs text-muted-foreground mb-1">Required</p>
              <p className="text-lg font-semibold text-destructive flex items-center gap-1">
                <Bitcoin className="h-4 w-4" />
                {requiredAmount.toFixed(4)} ETH
              </p>
            </div>
          </div>

          {/* Shortfall */}
          <div className="p-4 rounded-lg border border-warning/30 bg-warning/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">You need to add at least</p>
                <p className="text-2xl font-bold text-warning">
                  {suggestedDeposit.toFixed(4)} ETH
                </p>
                <p className="text-xs text-muted-foreground">
                  ≈ ₹{(suggestedDeposit * 250000).toLocaleString('en-IN')}
                </p>
              </div>
              <Button 
                onClick={() => handleDeposit(suggestedDeposit)}
                disabled={processing}
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                )}
                Add {suggestedDeposit.toFixed(2)} ETH
              </Button>
            </div>
          </div>

          {/* Quick Add Options */}
          <div>
            <p className="text-sm font-medium mb-2">Quick Add (Demo)</p>
            <div className="grid grid-cols-4 gap-2">
              {[0.5, 1, 2, 5].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  onClick={() => handleDeposit(amount)}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    `+${amount} ETH`
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <Label>Custom Amount (ETH)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                step="0.01"
                min="0.01"
              />
              <Button onClick={handleCustomDeposit} disabled={processing}>
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel Investment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
