import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Startup, SECTOR_LABELS, SECTOR_ICONS, FUNDING_STAGE_LABELS } from '@/types/database';
import { 
  Heart, 
  TrendingUp, 
  ArrowRight,
  Trash2,
  Bookmark
} from 'lucide-react';

interface WatchlistItem {
  id: string;
  startup_id: string;
  created_at: string;
  startup: Startup;
}

export default function Watchlist() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchWatchlist();
    }
  }, [user, authLoading, navigate]);

  const fetchWatchlist = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('watchlist')
      .select('*, startup:startups(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setWatchlist((data || []) as WatchlistItem[]);
    setLoading(false);
  };

  const removeFromWatchlist = async (id: string) => {
    await supabase.from('watchlist').delete().eq('id', id);
    setWatchlist(prev => prev.filter(w => w.id !== id));
    toast({ title: 'Removed from watchlist' });
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-48 mb-6" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)}
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
            <h1 className="text-3xl font-display font-bold mb-2">My Watchlist</h1>
            <p className="text-muted-foreground">Startups you're keeping an eye on</p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Heart className="h-4 w-4 mr-2 fill-primary text-primary" />
            {watchlist.length} saved
          </Badge>
        </div>

        {watchlist.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Bookmark className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No saved startups yet</h3>
              <p className="text-muted-foreground mb-6">
                Browse startups and add them to your watchlist to keep track of your favorites.
              </p>
              <Button asChild>
                <Link to="/startups">
                  Explore Startups
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlist.map((item) => {
              const startup = item.startup;
              if (!startup) return null;

              const progress = (startup.amount_raised / startup.funding_goal) * 100;

              return (
                <Card key={item.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                          {SECTOR_ICONS[startup.sector]}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{startup.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {SECTOR_LABELS[startup.sector]}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFromWatchlist(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {startup.tagline}
                    </p>

                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {FUNDING_STAGE_LABELS[startup.funding_stage]}
                      </Badge>
                      <Badge variant="secondary" className="bg-accent/10 text-accent">
                        Min ₹{startup.min_investment.toLocaleString('en-IN')}
                      </Badge>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Funding Progress</span>
                        <span className="font-medium">{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        ₹{startup.amount_raised.toLocaleString('en-IN')} of ₹{startup.funding_goal.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" asChild>
                        <Link to={`/startups/${startup.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button className="flex-1" asChild>
                        <Link to={`/startups/${startup.id}`}>
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Invest
                        </Link>
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      Added {new Date(item.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
