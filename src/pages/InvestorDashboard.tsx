import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Investment, Startup, SECTOR_LABELS, SECTOR_ICONS } from '@/types/database';
import { 
  TrendingUp, 
  Wallet, 
  Building2, 
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InvestorDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<(Investment & { startup: Startup })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || role !== 'investor')) {
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchInvestments();
    }
  }, [user]);

  const fetchInvestments = async () => {
    const { data, error } = await supabase
      .from('investments')
      .select(`
        *,
        startup:startups(*)
      `)
      .eq('investor_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setInvestments(data as (Investment & { startup: Startup })[]);
    }
    setLoading(false);
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const uniqueStartups = new Set(investments.map(inv => inv.startup_id)).size;

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Investor Dashboard</h1>
            <p className="text-muted-foreground">Track your investments and discover new opportunities</p>
          </div>
          <Button asChild>
            <Link to="/startups">
              Explore Startups
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="text-2xl font-display font-bold">
                    ₹{totalInvested.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Startups Invested</p>
                  <p className="text-2xl font-display font-bold">{uniqueStartups}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Investments</p>
                  <p className="text-2xl font-display font-bold">{investments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investments */}
        <Card>
          <CardHeader>
            <CardTitle>Your Investments</CardTitle>
          </CardHeader>
          <CardContent>
            {investments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-xl font-semibold mb-2">No investments yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start exploring startups and make your first investment
                </p>
                <Button asChild>
                  <Link to="/startups">Browse Startups</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {investments.map((investment) => (
                  <Link
                    key={investment.id}
                    to={`/startups/${investment.startup_id}`}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
                      {investment.startup?.logo_url ? (
                        <img 
                          src={investment.startup.logo_url} 
                          alt={investment.startup?.name} 
                          className="h-full w-full object-cover rounded-xl"
                        />
                      ) : (
                        SECTOR_ICONS[investment.startup?.sector || 'technology']
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{investment.startup?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {SECTOR_LABELS[investment.startup?.sector || 'technology']}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        ₹{investment.amount.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(investment.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
