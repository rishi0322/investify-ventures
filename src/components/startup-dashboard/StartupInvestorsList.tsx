import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Startup } from '@/types/database';
import { Users, DollarSign } from 'lucide-react';

interface Props {
  investments: any[];
  startup: Startup;
}

export function StartupInvestorsList({ investments, startup }: Props) {
  // Generate sample investors if no real data
  const displayInvestments = investments.length > 0 ? investments : sampleInvestorData();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Investor List
        </CardTitle>
        <CardDescription>All investors who have invested in {startup.name}</CardDescription>
      </CardHeader>
      <CardContent>
        {displayInvestments.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No investments yet</h3>
            <p className="text-sm text-muted-foreground">Investments will appear here once investors fund your startup.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investor ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Equity</TableHead>
                  <TableHead>Shares</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayInvestments.map((inv: any) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs">{inv.investor_id?.slice(0, 8) || 'INV-XXX'}...</TableCell>
                    <TableCell className="font-semibold">₹{inv.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{(inv.equity_percentage || 0).toFixed(2)}%</TableCell>
                    <TableCell>{(inv.shares_acquired || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={inv.status === 'completed' ? 'default' : 'secondary'}
                        className={inv.status === 'completed' ? 'bg-success/10 text-success border-success/20' : ''}>
                        {inv.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function sampleInvestorData() {
  return [
    { id: '1', investor_id: 'inv-abc12345', amount: 50000, equity_percentage: 0.5, shares_acquired: 5000, created_at: '2024-10-15', status: 'completed' },
    { id: '2', investor_id: 'inv-def67890', amount: 100000, equity_percentage: 1.0, shares_acquired: 10000, created_at: '2024-11-02', status: 'completed' },
    { id: '3', investor_id: 'inv-ghi11223', amount: 25000, equity_percentage: 0.25, shares_acquired: 2500, created_at: '2024-11-20', status: 'completed' },
    { id: '4', investor_id: 'inv-jkl44556', amount: 75000, equity_percentage: 0.75, shares_acquired: 7500, created_at: '2024-12-05', status: 'completed' },
    { id: '5', investor_id: 'inv-mno77889', amount: 200000, equity_percentage: 2.0, shares_acquired: 20000, created_at: '2024-12-18', status: 'completed' },
  ];
}
