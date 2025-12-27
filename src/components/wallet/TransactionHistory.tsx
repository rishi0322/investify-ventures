import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Wallet as WalletIcon, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Bitcoin, 
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  crypto_currency: string;
  wallet_address: string | null;
  transaction_hash: string | null;
  status: string;
  created_at: string;
  confirmed_at?: string | null;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');

  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'deposits') return tx.transaction_type === 'deposit';
    if (activeTab === 'withdrawals') return tx.transaction_type === 'withdrawal';
    if (activeTab === 'investments') return tx.transaction_type === 'investment';
    return true;
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied!` });
  };

  const truncateHash = (hash: string | null) => {
    if (!hash) return '—';
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge variant="default" className="bg-accent/20 text-accent border-accent/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownToLine className="h-4 w-4 text-accent" />;
      case 'withdrawal':
        return <ArrowUpFromLine className="h-4 w-4 text-destructive" />;
      case 'investment':
        return <Bitcoin className="h-4 w-4 text-primary" />;
      default:
        return <WalletIcon className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    totalDeposits: transactions
      .filter(t => t.transaction_type === 'deposit' && t.status === 'confirmed')
      .reduce((sum, t) => sum + t.amount, 0),
    totalWithdrawals: transactions
      .filter(t => t.transaction_type === 'withdrawal' && t.status === 'confirmed')
      .reduce((sum, t) => sum + t.amount, 0),
    totalInvestments: transactions
      .filter(t => t.transaction_type === 'investment' && t.status === 'confirmed')
      .reduce((sum, t) => sum + t.amount, 0),
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Complete log of all your wallet transactions</CardDescription>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <p className="text-accent font-semibold">+{stats.totalDeposits.toFixed(4)} ETH</p>
              <p className="text-xs text-muted-foreground">Total Deposited</p>
            </div>
            <div className="text-center">
              <p className="text-destructive font-semibold">-{stats.totalWithdrawals.toFixed(4)} ETH</p>
              <p className="text-xs text-muted-foreground">Total Withdrawn</p>
            </div>
            {stats.totalInvestments > 0 && (
              <div className="text-center">
                <p className="text-primary font-semibold">-{stats.totalInvestments.toFixed(4)} ETH</p>
                <p className="text-xs text-muted-foreground">Invested</p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              All ({transactions.length})
            </TabsTrigger>
            <TabsTrigger value="deposits">
              Deposits ({transactions.filter(t => t.transaction_type === 'deposit').length})
            </TabsTrigger>
            <TabsTrigger value="withdrawals">
              Withdrawals ({transactions.filter(t => t.transaction_type === 'withdrawal').length})
            </TabsTrigger>
            <TabsTrigger value="investments">
              Investments ({transactions.filter(t => t.transaction_type === 'investment').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <WalletIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {activeTab === 'all' ? 'No transactions yet' : `No ${activeTab} found`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden md:table-cell">Transaction Hash</TableHead>
                      <TableHead className="hidden lg:table-cell">Wallet Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tx.transaction_type === 'deposit' ? 'bg-accent/10' : 
                              tx.transaction_type === 'withdrawal' ? 'bg-destructive/10' : 'bg-primary/10'
                            }`}>
                              {getTransactionIcon(tx.transaction_type)}
                            </div>
                            <span className="capitalize font-medium">{tx.transaction_type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${
                            tx.transaction_type === 'deposit' ? 'text-accent' : 
                            tx.transaction_type === 'withdrawal' || tx.transaction_type === 'investment' 
                              ? 'text-destructive' : ''
                          }`}>
                            {tx.transaction_type === 'deposit' ? '+' : '-'}
                            {tx.amount.toFixed(4)} {tx.crypto_currency}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            ≈ ₹{(tx.amount * 250000).toLocaleString('en-IN')}
                          </p>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {tx.transaction_hash ? (
                            <div className="flex items-center gap-1">
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {truncateHash(tx.transaction_hash)}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(tx.transaction_hash!, 'Hash')}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => window.open(`https://etherscan.io/tx/${tx.transaction_hash}`, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {tx.wallet_address ? (
                            <div className="flex items-center gap-1">
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {truncateHash(tx.wallet_address)}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(tx.wallet_address!, 'Address')}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div>
                            <p className="text-sm">{formatDate(tx.created_at)}</p>
                            {tx.confirmed_at && tx.status === 'confirmed' && (
                              <p className="text-xs text-muted-foreground">
                                Confirmed: {formatDate(tx.confirmed_at)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
