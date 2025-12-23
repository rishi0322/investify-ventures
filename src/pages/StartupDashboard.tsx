import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Startup, StartupSector, FundingStage, SECTOR_LABELS, FUNDING_STAGE_LABELS, Investment } from '@/types/database';
import { 
  Plus, 
  Edit2, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';

const SECTORS: StartupSector[] = [
  'technology', 'healthcare', 'fintech', 'edtech', 'ecommerce', 'green_energy',
  'real_estate', 'consumer', 'manufacturing', 'agriculture', 'logistics', 'media_entertainment'
];

const STAGES: FundingStage[] = ['pre_seed', 'seed', 'series_a', 'series_b', 'series_c'];

export default function StartupDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [startup, setStartup] = useState<Startup | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    tagline: '',
    description: '',
    sector: 'technology' as StartupSector,
    funding_stage: 'seed' as FundingStage,
    funding_goal: '',
    min_investment: '500',
    pitch_video_url: '',
    pitch_deck_url: '',
    website_url: '',
    founded_year: '',
    team_size: '',
    location: '',
  });

  useEffect(() => {
    if (!authLoading && (!user || role !== 'startup')) {
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStartup();
    }
  }, [user]);

  const fetchStartup = async () => {
    const { data, error } = await supabase
      .from('startups')
      .select('*')
      .eq('founder_id', user?.id)
      .maybeSingle();

    if (!error && data) {
      setStartup(data as Startup);
      setForm({
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        sector: data.sector as StartupSector,
        funding_stage: data.funding_stage as FundingStage,
        funding_goal: data.funding_goal.toString(),
        min_investment: data.min_investment.toString(),
        pitch_video_url: data.pitch_video_url || '',
        pitch_deck_url: data.pitch_deck_url || '',
        website_url: data.website_url || '',
        founded_year: data.founded_year?.toString() || '',
        team_size: data.team_size?.toString() || '',
        location: data.location || '',
      });
      
      // Fetch investments
      const { data: invData } = await supabase
        .from('investments')
        .select('*')
        .eq('startup_id', data.id)
        .order('created_at', { ascending: false });
      
      if (invData) {
        setInvestments(invData as Investment[]);
      }
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      founder_id: user?.id,
      name: form.name,
      tagline: form.tagline,
      description: form.description,
      sector: form.sector,
      funding_stage: form.funding_stage,
      funding_goal: parseInt(form.funding_goal),
      min_investment: parseInt(form.min_investment) || 500,
      pitch_video_url: form.pitch_video_url || null,
      pitch_deck_url: form.pitch_deck_url || null,
      website_url: form.website_url || null,
      founded_year: form.founded_year ? parseInt(form.founded_year) : null,
      team_size: form.team_size ? parseInt(form.team_size) : null,
      location: form.location || null,
    };

    let error;
    if (startup) {
      ({ error } = await supabase
        .from('startups')
        .update(payload)
        .eq('id', startup.id));
    } else {
      ({ error } = await supabase
        .from('startups')
        .insert(payload));
    }

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } else {
      toast({
        title: startup ? 'Startup updated' : 'Startup created',
        description: startup ? 'Your changes have been saved.' : 'Your startup has been submitted for verification.',
      });
      setIsEditing(false);
      fetchStartup();
    }
    setSaving(false);
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-8" />
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  const progress = startup ? (startup.amount_raised / startup.funding_goal) * 100 : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Startup Dashboard</h1>
            <p className="text-muted-foreground">Manage your startup profile and track investments</p>
          </div>
          {startup && !isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {!startup || isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle>{startup ? 'Edit Startup Profile' : 'Create Your Startup Profile'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Startup Name *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline *</Label>
                    <Input
                      id="tagline"
                      value={form.tagline}
                      onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                      placeholder="A short, catchy description"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Tell investors about your startup, the problem you solve, and your traction..."
                    rows={5}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Sector *</Label>
                    <Select value={form.sector} onValueChange={(v) => setForm({ ...form, sector: v as StartupSector })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTORS.map(s => (
                          <SelectItem key={s} value={s}>{SECTOR_LABELS[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Funding Stage *</Label>
                    <Select value={form.funding_stage} onValueChange={(v) => setForm({ ...form, funding_stage: v as FundingStage })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGES.map(s => (
                          <SelectItem key={s} value={s}>{FUNDING_STAGE_LABELS[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="funding_goal">Funding Goal (₹) *</Label>
                    <Input
                      id="funding_goal"
                      type="number"
                      value={form.funding_goal}
                      onChange={(e) => setForm({ ...form, funding_goal: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min_investment">Minimum Investment (₹)</Label>
                    <Input
                      id="min_investment"
                      type="number"
                      value={form.min_investment}
                      onChange={(e) => setForm({ ...form, min_investment: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pitch_video_url">Pitch Video URL</Label>
                    <Input
                      id="pitch_video_url"
                      value={form.pitch_video_url}
                      onChange={(e) => setForm({ ...form, pitch_video_url: e.target.value })}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pitch_deck_url">Pitch Deck URL</Label>
                    <Input
                      id="pitch_deck_url"
                      value={form.pitch_deck_url}
                      onChange={(e) => setForm({ ...form, pitch_deck_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="website_url">Website</Label>
                    <Input
                      id="website_url"
                      value={form.website_url}
                      onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="founded_year">Founded Year</Label>
                    <Input
                      id="founded_year"
                      type="number"
                      value={form.founded_year}
                      onChange={(e) => setForm({ ...form, founded_year: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team_size">Team Size</Label>
                    <Input
                      id="team_size"
                      type="number"
                      value={form.team_size}
                      onChange={(e) => setForm({ ...form, team_size: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>

                <div className="flex gap-4">
                  {isEditing && (
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        {startup ? 'Save Changes' : 'Submit for Verification'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Status Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {startup.verification_status === 'approved' ? (
                    <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    </div>
                  ) : startup.verification_status === 'rejected' ? (
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <XCircle className="h-6 w-6 text-destructive" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-warning" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">
                      {startup.verification_status === 'approved' && 'Your startup is verified and live!'}
                      {startup.verification_status === 'pending' && 'Verification pending'}
                      {startup.verification_status === 'rejected' && 'Verification rejected'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {startup.verification_status === 'approved' && 'Investors can now discover and invest in your startup.'}
                      {startup.verification_status === 'pending' && 'Our team is reviewing your application. This usually takes 2-3 business days.'}
                      {startup.verification_status === 'rejected' && (startup.rejection_reason || 'Please update your profile and resubmit.')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount Raised</p>
                      <p className="text-2xl font-display font-bold">
                        ₹{startup.amount_raised.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="mt-4 h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {progress.toFixed(0)}% of ₹{startup.funding_goal.toLocaleString('en-IN')} goal
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Investors</p>
                      <p className="text-2xl font-display font-bold">{investments.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Badge 
                    variant={startup.verification_status === 'approved' ? 'default' : 'secondary'}
                    className="mb-2"
                  >
                    {startup.verification_status === 'approved' ? 'Verified' : startup.verification_status}
                  </Badge>
                  <h4 className="font-semibold">{startup.name}</h4>
                  <p className="text-sm text-muted-foreground">{SECTOR_LABELS[startup.sector]}</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Investments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Investments</CardTitle>
              </CardHeader>
              <CardContent>
                {investments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No investments yet. Share your startup to attract investors!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {investments.slice(0, 10).map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">New Investment</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(inv.created_at).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-accent">
                          +₹{inv.amount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
