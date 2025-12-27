import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Wallet as WalletIcon, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Bitcoin, 
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  RefreshCcw,
  Loader2
} from 'lucide-react';

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  crypto_currency: string;
  wallet_address: string | null;
  transaction_hash: string | null;
  status: string;
  created_at: string;
}

interface UserWallet {
  id: string;
  wallet_address: string | null;
  balance: number;
}

export default function Wallet() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [processing, setProcessing] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchWalletData();
    }
  }, [user, authLoading, navigate]);

  const fetchWalletData = async () => {
    if (!user) return;

    // Fetch or create wallet
    let { data: walletData } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!walletData) {
      const { data: newWallet } = await supabase
        .from('user_wallets')
        .insert({ 
          user_id: user.id, 
          wallet_address: `0x${Math.random().toString(16).slice(2, 42)}` 
        })
        .select()
        .single();
      walletData = newWallet;
    }

    setWallet(walletData as UserWallet);

    // Fetch transactions
    const { data: txData } = await supabase
      .from('blockchain_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setTransactions((txData || []) as Transaction[]);
    setLoading(false);
  };

  const handleDeposit = async () => {
    if (!user || !wallet) return;

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid amount' });
      return;
    }

    setProcessing(true);

    // Simulate blockchain confirmation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

    // Create transaction record
    await supabase.from('blockchain_transactions').insert({
      user_id: user.id,
      transaction_type: 'deposit',
      amount,
      crypto_currency: 'ETH',
      wallet_address: wallet.wallet_address,
      transaction_hash: txHash,
      status: 'confirmed',
      confirmed_at: new Date().toISOString()
    });

    // Update wallet balance
    await supabase
      .from('user_wallets')
      .update({ balance: (wallet.balance || 0) + amount })
      .eq('id', wallet.id);

    toast({ 
      title: 'Deposit successful!', 
      description: `${amount} ETH has been added to your wallet.` 
    });

    setDepositOpen(false);
    setDepositAmount('');
    setProcessing(false);
    fetchWalletData();
  };

  const handleWithdraw = async () => {
    if (!user || !wallet) return;

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid amount' });
      return;
    }

    if (amount > wallet.balance) {
      toast({ variant: 'destructive', title: 'Insufficient balance' });
      return;
    }

    if (!withdrawAddress || !withdrawAddress.startsWith('0x')) {
      toast({ variant: 'destructive', title: 'Invalid wallet address' });
      return;
    }

    setProcessing(true);

    // Simulate blockchain confirmation
    await new Promise(resolve => setTimeout(resolve, 2500));

    const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

    // Create transaction record
    await supabase.from('blockchain_transactions').insert({
      user_id: user.id,
      transaction_type: 'withdrawal',
      amount,
      crypto_currency: 'ETH',
      wallet_address: withdrawAddress,
      transaction_hash: txHash,
      status: 'confirmed',
      confirmed_at: new Date().toISOString()
    });

    // Update wallet balance
    await supabase
      .from('user_wallets')
      .update({ balance: wallet.balance - amount })
      .eq('id', wallet.id);

    toast({ 
      title: 'Withdrawal successful!', 
      description: `${amount} ETH has been sent to ${withdrawAddress.slice(0, 10)}...` 
    });

    setWithdrawOpen(false);
    setWithdrawAmount('');
    setWithdrawAddress('');
    setProcessing(false);
    fetchWalletData();
  };

  const copyAddress = () => {
    if (wallet?.wallet_address) {
      navigator.clipboard.writeText(wallet.wallet_address);
      toast({ title: 'Address copied!' });
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Crypto Wallet</h1>
            <p className="text-muted-foreground">Manage your blockchain payments and withdrawals</p>
          </div>
          <Button variant="outline" onClick={fetchWalletData}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Wallet Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2 gradient-hero border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
                  <p className="text-4xl font-display font-bold flex items-center gap-2">
                    <Bitcoin className="h-8 w-8 text-amber-500" />
                    {wallet?.balance?.toFixed(4) || '0.0000'} ETH
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ≈ ₹{((wallet?.balance || 0) * 250000).toLocaleString('en-IN')}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg mb-6">
                <code className="text-sm flex-1 truncate">{wallet?.wallet_address}</code>
                <Button variant="ghost" size="icon" onClick={copyAddress}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-3">
                <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1">
                      <ArrowDownToLine className="h-4 w-4 mr-2" />
                      Deposit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Deposit ETH</DialogTitle>
                      <DialogDescription>
                        Add funds to your wallet (Demo - no real transaction)
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
                        Confirm Deposit
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <ArrowUpFromLine className="h-4 w-4 mr-2" />
                      Withdraw
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Withdraw ETH</DialogTitle>
                      <DialogDescription>
                        Send funds to an external wallet (Demo - no real transaction)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Recipient Address</Label>
                        <Input
                          placeholder="0x..."
                          value={withdrawAddress}
                          onChange={(e) => setWithdrawAddress(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Amount (ETH)</Label>
                        <Input
                          type="number"
                          placeholder="0.1"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          step="0.01"
                        />
                        <p className="text-xs text-muted-foreground">
                          Available: {wallet?.balance?.toFixed(4) || '0'} ETH
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setWithdrawOpen(false)}>Cancel</Button>
                      <Button onClick={handleWithdraw} disabled={processing}>
                        {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Confirm Withdrawal
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Deposits</span>
                <span className="font-medium">
                  {transactions.filter(t => t.transaction_type === 'deposit').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Withdrawals</span>
                <span className="font-medium">
                  {transactions.filter(t => t.transaction_type === 'withdrawal').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Investments Made</span>
                <span className="font-medium">
                  {transactions.filter(t => t.transaction_type === 'investment').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent blockchain transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <WalletIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.transaction_type === 'deposit' ? 'bg-accent/10' : 
                        tx.transaction_type === 'withdrawal' ? 'bg-destructive/10' : 'bg-primary/10'
                      }`}>
                        {tx.transaction_type === 'deposit' ? (
                          <ArrowDownToLine className="h-5 w-5 text-accent" />
                        ) : tx.transaction_type === 'withdrawal' ? (
                          <ArrowUpFromLine className="h-5 w-5 text-destructive" />
                        ) : (
                          <Bitcoin className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{tx.transaction_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        tx.transaction_type === 'deposit' ? 'text-accent' : 
                        tx.transaction_type === 'withdrawal' ? 'text-destructive' : ''
                      }`}>
                        {tx.transaction_type === 'deposit' ? '+' : '-'}{tx.amount} {tx.crypto_currency}
                      </p>
                      <Badge variant={tx.status === 'confirmed' ? 'default' : tx.status === 'pending' ? 'secondary' : 'destructive'} className="text-xs">
                        {tx.status === 'confirmed' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : 
                         tx.status === 'pending' ? <Clock className="h-3 w-3 mr-1" /> : 
                         <XCircle className="h-3 w-3 mr-1" />}
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
