import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Startup, SECTOR_LABELS, FUNDING_STAGE_LABELS, SECTOR_ICONS } from '@/types/database';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  MapPin, 
  Calendar, 
  Globe, 
  Play, 
  FileText, 
  Heart,
  HeartOff,
  Loader2,
  CheckCircle2,
  Share2
} from 'lucide-react';

export default function StartupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { toast } = useToast();
  
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [investAmount, setInvestAmount] = useState('');
  const [investing, setInvesting] = useState(false);
  const [investDialogOpen, setInvestDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStartup();
      if (user) {
        checkWatchlist();
      }
    }
  }, [id, user]);

  const fetchStartup = async () => {
    const { data, error } = await supabase
      .from('startups')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      setStartup(data as Startup);
    }
    setLoading(false);
  };

  const checkWatchlist = async () => {
    if (!user || !id) return;
    
    const { data } = await supabase
      .from('watchlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('startup_id', id)
      .maybeSingle();
    
    setIsInWatchlist(!!data);
  };

  const toggleWatchlist = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (isInWatchlist) {
      await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('startup_id', id);
      setIsInWatchlist(false);
      toast({ title: 'Removed from watchlist' });
    } else {
      await supabase
        .from('watchlist')
        .insert({ user_id: user.id, startup_id: id });
      setIsInWatchlist(true);
      toast({ title: 'Added to watchlist' });
    }
  };

  const handleInvest = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (role !== 'investor') {
      toast({
        variant: 'destructive',
        title: 'Cannot invest',
        description: 'Only investors can make investments.',
      });
      return;
    }

    const amount = parseInt(investAmount);
    if (!startup || isNaN(amount) || amount < startup.min_investment) {
      toast({
        variant: 'destructive',
        title: 'Invalid amount',
        description: `Minimum investment is ₹${startup?.min_investment || 500}`,
      });
      return;
    }

    setInvesting(true);

    // Mock payment - in production this would integrate with a payment gateway
    await new Promise(resolve => setTimeout(resolve, 1500));

    const { error } = await supabase
      .from('investments')
      .insert({
        investor_id: user.id,
        startup_id: id,
        amount,
      });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Investment failed',
        description: error.message,
      });
    } else {
      toast({
        title: 'Investment successful!',
        description: `You've invested ₹${amount.toLocaleString('en-IN')} in ${startup?.name}`,
      });
      setInvestDialogOpen(false);
      setInvestAmount('');
      fetchStartup(); // Refresh to show updated amount
    }
    
    setInvesting(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!startup) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Startup not found</h1>
          <Button asChild>
            <Link to="/startups">Browse Startups</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const progress = (startup.amount_raised / startup.funding_goal) * 100;
  const formattedGoal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(startup.funding_goal);
  const formattedRaised = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(startup.amount_raised);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link 
          to="/startups" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to startups
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center text-4xl shrink-0">
                {startup.logo_url ? (
                  <img 
                    src={startup.logo_url} 
                    alt={startup.name} 
                    className="h-full w-full object-cover rounded-2xl"
                  />
                ) : (
                  SECTOR_ICONS[startup.sector]
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-display font-bold">{startup.name}</h1>
                  <Badge variant="secondary" className="text-accent bg-accent/10">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground mb-3">{startup.tagline}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {SECTOR_ICONS[startup.sector]} {SECTOR_LABELS[startup.sector]}
                  </Badge>
                  <Badge variant="outline">
                    {FUNDING_STAGE_LABELS[startup.funding_stage]}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Video/Media */}
            {startup.pitch_video_url && (
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <a 
                        href={startup.pitch_video_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 gradient-primary text-primary-foreground px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
                      >
                        <Play className="h-5 w-5" />
                        Watch Pitch Video
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About {startup.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{startup.description}</p>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {startup.founded_year && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Founded</p>
                        <p className="font-medium">{startup.founded_year}</p>
                      </div>
                    </div>
                  )}
                  {startup.team_size && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Team Size</p>
                        <p className="font-medium">{startup.team_size} members</p>
                      </div>
                    </div>
                  )}
                  {startup.location && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{startup.location}</p>
                      </div>
                    </div>
                  )}
                  {startup.website_url && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Website</p>
                        <a 
                          href={startup.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investment Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Amount Raised</p>
                    <p className="text-3xl font-display font-bold text-accent">{formattedRaised}</p>
                  </div>

                  <Progress value={Math.min(progress, 100)} className="h-3" />

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{progress.toFixed(0)}% funded</span>
                    <span className="font-medium">Goal: {formattedGoal}</span>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Min Investment</span>
                      <span className="font-medium">₹{startup.min_investment.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <Dialog open={investDialogOpen} onOpenChange={setInvestDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        <TrendingUp className="mr-2 h-5 w-5" />
                        Invest Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invest in {startup.name}</DialogTitle>
                        <DialogDescription>
                          Enter the amount you want to invest. Minimum investment is ₹{startup.min_investment.toLocaleString('en-IN')}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Investment Amount (₹)</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder={startup.min_investment.toString()}
                            value={investAmount}
                            onChange={(e) => setInvestAmount(e.target.value)}
                            min={startup.min_investment}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          This is a mock investment for demo purposes. No actual payment will be processed.
                        </p>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setInvestDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleInvest} disabled={investing}>
                          {investing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'Confirm Investment'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={toggleWatchlist}
                    >
                      {isInWatchlist ? (
                        <>
                          <HeartOff className="mr-2 h-4 w-4" />
                          Remove
                        </>
                      ) : (
                        <>
                          <Heart className="mr-2 h-4 w-4" />
                          Watchlist
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {startup.pitch_deck_url && (
                    <a 
                      href={startup.pitch_deck_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      View Pitch Deck
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
