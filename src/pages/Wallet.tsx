import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { WalletPinSetup, PinVerifyDialog } from '@/components/wallet/WalletPinSetup';
import { TransactionHistory } from '@/components/wallet/TransactionHistory';
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
  Loader2,
  Lock,
  Shield,
  Settings,
  IndianRupee,
  DollarSign,
  Coins,
  TrendingUp,
  ArrowRightLeft
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
  wallet_pin: string | null;
  tpin: string | null;
  pin_set: boolean;
  tpin_set: boolean;
}

// Currency configurations
const CURRENCIES = {
  ETH: { symbol: 'ETH', name: 'Ethereum', icon: Bitcoin, color: 'text-purple-500', rate: 250000 },
  BTC: { symbol: 'BTC', name: 'Bitcoin', icon: Bitcoin, color: 'text-orange-500', rate: 7500000 },
  INR: { symbol: '₹', name: 'Indian Rupee', icon: IndianRupee, color: 'text-green-500', rate: 1 },
  USDT: { symbol: 'USDT', name: 'Tether', icon: DollarSign, color: 'text-emerald-500', rate: 83 },
  SOL: { symbol: 'SOL', name: 'Solana', icon: Coins, color: 'text-gradient-purple', rate: 15000 },
} as const;

type CurrencyType = keyof typeof CURRENCIES;

interface CurrencyBalance {
  currency: CurrencyType;
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
  
  // Multi-currency state
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('ETH');
  const [currencyBalances, setCurrencyBalances] = useState<CurrencyBalance[]>([
    { currency: 'ETH', balance: 0 },
    { currency: 'BTC', balance: 0 },
    { currency: 'INR', balance: 0 },
    { currency: 'USDT', balance: 0 },
    { currency: 'SOL', balance: 0 },
  ]);
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertFrom, setConvertFrom] = useState<CurrencyType>('ETH');
  const [convertTo, setConvertTo] = useState<CurrencyType>('INR');
  const [convertAmount, setConvertAmount] = useState('');
  
  // PIN related states
  const [pinSetupOpen, setPinSetupOpen] = useState(false);
  const [tpinSetupOpen, setTpinSetupOpen] = useState(false);
  const [pinVerifyOpen, setPinVerifyOpen] = useState(false);
  const [tpinVerifyOpen, setTpinVerifyOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'deposit' | 'withdraw' | null>(null);
  const [walletLocked, setWalletLocked] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchWalletData();
    }
  }, [user, authLoading, navigate]);

  const fetchWalletData = async () => {
    if (!user) return;

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
    
    // Simulate multi-currency balances based on main ETH balance
    const ethBalance = walletData?.balance || 0;
    setCurrencyBalances([
      { currency: 'ETH', balance: ethBalance },
      { currency: 'BTC', balance: ethBalance * 0.03 }, // Simulated ratio
      { currency: 'INR', balance: ethBalance * 250000 },
      { currency: 'USDT', balance: ethBalance * 3000 },
      { currency: 'SOL', balance: ethBalance * 15 },
    ]);
    
    // If PIN is set, wallet should be locked initially
    if (walletData?.pin_set) {
      setWalletLocked(true);
    } else {
      setWalletLocked(false);
    }

    const { data: txData } = await supabase
      .from('blockchain_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setTransactions((txData || []) as Transaction[]);
    setLoading(false);
  };

  // Currency conversion
  const handleConvert = async () => {
    const amount = parseFloat(convertAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid amount' });
      return;
    }

    const fromBalance = currencyBalances.find(b => b.currency === convertFrom)?.balance || 0;
    if (amount > fromBalance) {
      toast({ variant: 'destructive', title: 'Insufficient balance' });
      return;
    }

    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Calculate conversion
    const fromRate = CURRENCIES[convertFrom].rate;
    const toRate = CURRENCIES[convertTo].rate;
    const inrValue = amount * fromRate;
    const convertedAmount = inrValue / toRate;

    // Update balances
    setCurrencyBalances(prev => prev.map(b => {
      if (b.currency === convertFrom) return { ...b, balance: b.balance - amount };
      if (b.currency === convertTo) return { ...b, balance: b.balance + convertedAmount };
      return b;
    }));

    toast({
      title: 'Conversion successful!',
      description: `Converted ${amount} ${convertFrom} to ${convertedAmount.toFixed(4)} ${convertTo}`
    });

    setConvertOpen(false);
    setConvertAmount('');
    setProcessing(false);
  };

  const getTotalInINR = () => {
    return currencyBalances.reduce((total, b) => {
      return total + (b.balance * CURRENCIES[b.currency].rate);
    }, 0);
  };

  const unlockWallet = () => {
    if (wallet?.pin_set) {
      setPinVerifyOpen(true);
    } else {
      setWalletLocked(false);
    }
  };

  const handlePinVerifySuccess = () => {
    setWalletLocked(false);
    toast({ title: 'Wallet unlocked!' });
  };

  const handleTpinVerifySuccess = () => {
    if (pendingAction === 'withdraw') {
      executeWithdraw();
    }
    setPendingAction(null);
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

  const initiateWithdraw = () => {
    if (!wallet) return;

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

    // If TPIN is set, require verification
    if (wallet.tpin_set && wallet.tpin) {
      setPendingAction('withdraw');
      setTpinVerifyOpen(true);
    } else {
      executeWithdraw();
    }
  };

  const executeWithdraw = async () => {
    if (!user || !wallet) return;

    const amount = parseFloat(withdrawAmount);
    setProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 2500));

    const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

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

  // Locked wallet view
  if (walletLocked && wallet?.pin_set) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Lock className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-4">Wallet Locked</h1>
            <p className="text-muted-foreground mb-8">
              Enter your wallet PIN to access your funds and transaction history.
            </p>
            <Button size="lg" onClick={unlockWallet}>
              <Lock className="h-5 w-5 mr-2" />
              Unlock Wallet
            </Button>
          </div>

          <PinVerifyDialog
            walletId={wallet?.id || ''}
            type="pin"
            open={pinVerifyOpen}
            onOpenChange={setPinVerifyOpen}
            onSuccess={handlePinVerifySuccess}
            title="Unlock Wallet"
          />
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchWalletData}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Security Setup Banner */}
        {wallet && (!wallet.pin_set || !wallet.tpin_set) && (
          <Card className="mb-6 border-warning/50 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-warning" />
                  <div>
                    <p className="font-medium">Enhance Your Security</p>
                    <p className="text-sm text-muted-foreground">
                      {!wallet.pin_set && !wallet.tpin_set 
                        ? 'Set up Wallet PIN and TPIN for added security'
                        : !wallet.pin_set 
                        ? 'Set up Wallet PIN to lock your wallet'
                        : 'Set up TPIN for transaction verification'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!wallet.pin_set && (
                    <Button size="sm" variant="outline" onClick={() => setPinSetupOpen(true)}>
                      <Lock className="h-4 w-4 mr-1" />
                      Set PIN
                    </Button>
                  )}
                  {!wallet.tpin_set && (
                    <Button size="sm" variant="outline" onClick={() => setTpinSetupOpen(true)}>
                      <Shield className="h-4 w-4 mr-1" />
                      Set TPIN
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Multi-Currency Portfolio */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {currencyBalances.map((bal) => {
            const currency = CURRENCIES[bal.currency];
            const CurrencyIcon = currency.icon;
            return (
              <Card key={bal.currency} className={`hover:shadow-lg transition-shadow ${selectedCurrency === bal.currency ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CurrencyIcon className={`h-5 w-5 ${currency.color}`} />
                      <span className="font-medium">{currency.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{currency.symbol}</Badge>
                  </div>
                  <p className="text-2xl font-bold">{bal.balance.toFixed(bal.currency === 'INR' ? 2 : 4)}</p>
                  <p className="text-xs text-muted-foreground">
                    ≈ ₹{(bal.balance * currency.rate).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Wallet Card */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2 gradient-card border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
                  <p className="text-4xl font-display font-bold flex items-center gap-2">
                    <IndianRupee className="h-8 w-8 text-primary" />
                    {getTotalInINR().toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-sm text-success">+12.5% this month</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {wallet?.pin_set && (
                    <Badge variant="secondary" className="bg-accent/10 text-accent">
                      <Lock className="h-3 w-3 mr-1" />
                      Secured
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-accent/10 text-accent">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
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
                      <DialogTitle>Deposit Funds</DialogTitle>
                      <DialogDescription>
                        Add funds to your wallet (Demo - simulated transaction)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select value={selectedCurrency} onValueChange={(v) => setSelectedCurrency(v as CurrencyType)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(CURRENCIES).map(([key, curr]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <curr.icon className={`h-4 w-4 ${curr.color}`} />
                                  {curr.name} ({curr.symbol})
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Amount ({CURRENCIES[selectedCurrency].symbol})</Label>
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
                      <DialogTitle>Withdraw Funds</DialogTitle>
                      <DialogDescription>
                        Send funds to an external wallet (Demo - simulated transaction)
                        {wallet?.tpin_set && <span className="block mt-1 text-warning">TPIN verification required</span>}
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
                        <Label>Amount ({CURRENCIES[selectedCurrency].symbol})</Label>
                        <Input
                          type="number"
                          placeholder="0.1"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          step="0.01"
                        />
                        <p className="text-xs text-muted-foreground">
                          Available: {currencyBalances.find(b => b.currency === selectedCurrency)?.balance.toFixed(4) || '0'} {CURRENCIES[selectedCurrency].symbol}
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setWithdrawOpen(false)}>Cancel</Button>
                      <Button onClick={initiateWithdraw} disabled={processing}>
                        {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {wallet?.tpin_set ? 'Verify & Withdraw' : 'Confirm Withdrawal'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="flex-1">
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      Convert
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Convert Currency</DialogTitle>
                      <DialogDescription>
                        Swap between currencies instantly (Demo rates)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>From</Label>
                          <Select value={convertFrom} onValueChange={(v) => setConvertFrom(v as CurrencyType)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(CURRENCIES).map(([key, curr]) => (
                                <SelectItem key={key} value={key}>{curr.symbol}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>To</Label>
                          <Select value={convertTo} onValueChange={(v) => setConvertTo(v as CurrencyType)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(CURRENCIES).filter(([k]) => k !== convertFrom).map(([key, curr]) => (
                                <SelectItem key={key} value={key}>{curr.symbol}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Amount ({CURRENCIES[convertFrom].symbol})</Label>
                        <Input
                          type="number"
                          placeholder="0.1"
                          value={convertAmount}
                          onChange={(e) => setConvertAmount(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Available: {currencyBalances.find(b => b.currency === convertFrom)?.balance.toFixed(4)} {CURRENCIES[convertFrom].symbol}
                        </p>
                      </div>
                      {convertAmount && parseFloat(convertAmount) > 0 && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">You will receive approximately:</p>
                          <p className="text-lg font-bold">
                            {((parseFloat(convertAmount) * CURRENCIES[convertFrom].rate) / CURRENCIES[convertTo].rate).toFixed(4)} {CURRENCIES[convertTo].symbol}
                          </p>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setConvertOpen(false)}>Cancel</Button>
                      <Button onClick={handleConvert} disabled={processing}>
                        {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Convert
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Wallet PIN</p>
                  <p className="text-xs text-muted-foreground">Lock wallet access</p>
                </div>
                {wallet?.pin_set ? (
                  <Badge variant="default" className="bg-accent">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setPinSetupOpen(true)}>
                    Set Up
                  </Button>
                )}
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Transaction PIN</p>
                  <p className="text-xs text-muted-foreground">Verify withdrawals</p>
                </div>
                {wallet?.tpin_set ? (
                  <Badge variant="default" className="bg-accent">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setTpinSetupOpen(true)}>
                    Set Up
                  </Button>
                )}
              </div>
              <hr className="border-border" />
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
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <TransactionHistory transactions={transactions} />

        {/* PIN Setup Dialogs */}
        {wallet && (
          <>
            <WalletPinSetup
              walletId={wallet.id}
              type="pin"
              open={pinSetupOpen}
              onOpenChange={setPinSetupOpen}
              onSuccess={fetchWalletData}
            />
            <WalletPinSetup
              walletId={wallet.id}
              type="tpin"
              open={tpinSetupOpen}
              onOpenChange={setTpinSetupOpen}
              onSuccess={fetchWalletData}
            />
            {wallet.tpin_set && (
              <PinVerifyDialog
                walletId={wallet.id}
                type="tpin"
                open={tpinVerifyOpen}
                onOpenChange={setTpinVerifyOpen}
                onSuccess={handleTpinVerifySuccess}
                title="Verify Transaction PIN"
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}