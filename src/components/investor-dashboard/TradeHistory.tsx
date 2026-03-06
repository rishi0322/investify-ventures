import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, TrendingDown, BarChart2, History } from 'lucide-react';

const sampleTrades = [
  { id: '1', startup: 'TechNova AI', type: 'Buy', amount: 50000, returns: 62000, pnl: 12000, pnlPercent: 24, date: '2024-06-15', status: 'profit' },
  { id: '2', startup: 'GreenFuel Energy', type: 'Buy', amount: 30000, returns: 22500, pnl: -7500, pnlPercent: -25, date: '2024-07-02', status: 'loss' },
  { id: '3', startup: 'MediCare Plus', type: 'Buy', amount: 75000, returns: 97500, pnl: 22500, pnlPercent: 30, date: '2024-08-10', status: 'profit' },
  { id: '4', startup: 'EduSpark', type: 'Buy', amount: 25000, returns: 21250, pnl: -3750, pnlPercent: -15, date: '2024-09-05', status: 'loss' },
  { id: '5', startup: 'FinPay Solutions', type: 'Buy', amount: 100000, returns: 145000, pnl: 45000, pnlPercent: 45, date: '2024-09-28', status: 'profit' },
  { id: '6', startup: 'FarmConnect', type: 'Buy', amount: 40000, returns: 52000, pnl: 12000, pnlPercent: 30, date: '2024-10-15', status: 'profit' },
  { id: '7', startup: 'LogiTrack', type: 'Buy', amount: 60000, returns: 48000, pnl: -12000, pnlPercent: -20, date: '2024-11-01', status: 'loss' },
  { id: '8', startup: 'ShopEase', type: 'Buy', amount: 35000, returns: 47250, pnl: 12250, pnlPercent: 35, date: '2024-11-20', status: 'profit' },
];

const performanceData = [
  { month: 'Jun', value: 50000, portfolio: 50000 },
  { month: 'Jul', value: 72500, portfolio: 78000 },
  { month: 'Aug', value: 147500, portfolio: 165000 },
  { month: 'Sep', value: 272500, portfolio: 310000 },
  { month: 'Oct', value: 312500, portfolio: 362000 },
  { month: 'Nov', value: 407500, portfolio: 398000 },
  { month: 'Dec', value: 442500, portfolio: 480000 },
];

export function TradeHistory() {
  const totalInvested = sampleTrades.reduce((s, t) => s + t.amount, 0);
  const totalReturns = sampleTrades.reduce((s, t) => s + t.returns, 0);
  const totalPnL = totalReturns - totalInvested;
  const profitTrades = sampleTrades.filter(t => t.status === 'profit').length;
  const lossTrades = sampleTrades.filter(t => t.status === 'loss').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Invested</p>
            <p className="text-2xl font-bold mt-1">₹{totalInvested.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Value</p>
            <p className="text-2xl font-bold mt-1">₹{totalReturns.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        <Card className={`bg-gradient-to-br ${totalPnL >= 0 ? 'from-success/5 to-success/10 border-success/20' : 'from-destructive/5 to-destructive/10 border-destructive/20'}`}>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total P&L</p>
            <p className={`text-2xl font-bold mt-1 ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN')}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-info/5 to-info/10 border-info/20">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Win Rate</p>
            <p className="text-2xl font-bold mt-1">{Math.round((profitTrades / sampleTrades.length) * 100)}%</p>
            <p className="text-xs text-muted-foreground mt-1">{profitTrades}W / {lossTrades}L</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            Portfolio Performance Report
          </CardTitle>
          <CardDescription>Investment vs Portfolio value over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(222, 45%, 9%)', border: '1px solid hsl(222, 30%, 18%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                />
                <Line type="monotone" dataKey="value" stroke="hsl(38, 92%, 50%)" strokeWidth={2} name="Invested" dot={false} />
                <Line type="monotone" dataKey="portfolio" stroke="hsl(160, 70%, 42%)" strokeWidth={2} name="Portfolio" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* P&L Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Trade-wise P&L
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleTrades}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                <XAxis dataKey="startup" stroke="hsl(215, 20%, 55%)" fontSize={10} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(222, 45%, 9%)', border: '1px solid hsl(222, 30%, 18%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'P&L']}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {sampleTrades.map((entry, index) => (
                    <Cell key={index} fill={entry.pnl >= 0 ? 'hsl(160, 70%, 42%)' : 'hsl(0, 72%, 55%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Trade History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Investment History</CardTitle>
          <CardDescription>Complete log of all your trades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Startup</TableHead>
                  <TableHead>Invested</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>P&L</TableHead>
                  <TableHead>Return %</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">{trade.startup}</TableCell>
                    <TableCell>₹{trade.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>₹{trade.returns.toLocaleString('en-IN')}</TableCell>
                    <TableCell className={trade.pnl >= 0 ? 'text-success font-semibold' : 'text-destructive font-semibold'}>
                      {trade.pnl >= 0 ? '+' : ''}₹{trade.pnl.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <span className={`flex items-center gap-1 ${trade.pnlPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {trade.pnlPercent >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent}%
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(trade.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={trade.status === 'profit' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
                        {trade.status === 'profit' ? 'Profit' : 'Loss'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
