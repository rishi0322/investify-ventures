import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowUpRight,
  Loader2,
  Plus,
  Bitcoin
} from 'lucide-react';

interface WalletWidgetProps {
  userId: string;
}

export function WalletWidget({ userId }: WalletWidgetProps) {
  const { toast } = useToast();
  const [wallet, setWallet] = useState<{ id: string; balance: number; wallet_address: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, [userId]);

  const fetchWallet = async () => {
    let { data: walletData } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!walletData) {
      const { data: newWallet } = await supabase
        .from('user_wallets')
        .insert({ 
          user_id: userId, 
          wallet_address: `0x${Math.random().toString(16).slice(2, 42)}`,
          balance: 0
        })
        .select()
        .single();
      walletData = newWallet;
    }

    setWallet(walletData);
    setLoading(false);
  };

  const handleQuickDeposit = async (amount: number) => {
    if (!wallet) return;
    setProcessing(true);

    // Simulate blockchain confirmation
    await new Promise(resolve => setTimeout(resolve, 1500));

    const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

    await supabase.from('blockchain_transactions').insert({
      user_id: userId,
      transaction_type: 'deposit',
      amount,
      crypto_currency: 'ETH',
      wallet_address: wallet.wallet_address,
      transaction_hash: txHash,
      status: 'confirmed',
      confirmed_at: new Date().toISOString()
    });

    await supabase
      .from('user_wallets')
      .update({ balance: (wallet.balance || 0) + amount })
      .eq('id', wallet.id);

    toast({ 
      title: 'Deposit successful!', 
      description: `${amount} ETH has been added to your wallet.` 
    });

    setProcessing(false);
    fetchWallet();
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid amount' });
      return;
    }

    await handleQuickDeposit(amount);
    setDepositOpen(false);
    setDepositAmount('');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-8 bg-muted rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const ethBalance = wallet?.balance || 0;
  const inrValue = ethBalance * 250000; // Simulated ETH to INR conversion

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            My Wallet
          </div>
          <Link to="/wallet">
            <Button variant="ghost" size="sm">
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Balance Display */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
            <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
            <div className="flex items-center gap-2">
              <Bitcoin className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold">{ethBalance.toFixed(4)} ETH</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ≈ ₹{inrValue.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Quick Deposit Buttons */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Quick Add (Demo)</p>
            <div className="grid grid-cols-4 gap-2">
              {[0.1, 0.5, 1, 5].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDeposit(amount)}
                  disabled={processing}
                  className="text-xs"
                >
                  {processing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    `+${amount}`
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1" size="sm">
                  <ArrowDownToLine className="h-4 w-4 mr-1" />
                  Deposit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Funds</DialogTitle>
                  <DialogDescription>
                    Add sample ETH to your wallet (Demo mode)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Amount (ETH)</Label>
                    <Input
                      type="number"
                      placeholder="0.1"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      step="0.01"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDepositOpen(false)}>Cancel</Button>
                  <Button onClick={handleDeposit} disabled={processing}>
                    {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Add Funds
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Link to="/wallet" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <ArrowUpFromLine className="h-4 w-4 mr-1" />
                Manage
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
