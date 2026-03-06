import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SECTOR_LABELS, FUNDING_STAGE_LABELS, StartupSector, FundingStage } from '@/types/database';
import { Loader2, Rocket, CheckCircle2, Clock, Building2, Globe, MapPin, Users, Calendar, DollarSign, Target, FileText } from 'lucide-react';

export default function RegisterStartup() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);

  const [form, setForm] = useState({
    name: '',
    tagline: '',
    description: '',
    sector: '' as string,
    funding_stage: 'seed' as string,
    funding_goal: '',
    min_investment: '500',
    website_url: '',
    location: '',
    founded_year: '',
    team_size: '',
    valuation: '',
    total_shares: '1000000',
  });

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
    if (!authLoading && role && role !== 'startup') navigate('/dashboard');
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkExistingStartup();
    }
  }, [user]);

  const checkExistingStartup = async () => {
    const { data } = await supabase
      .from('startups')
      .select('id')
      .eq('founder_id', user!.id)
      .maybeSingle();

    if (data) {
      navigate('/startup-dashboard');
    }
    setCheckingExisting(false);
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.tagline || !form.description || !form.sector || !form.funding_goal) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('startups').insert({
      founder_id: user!.id,
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      sector: form.sector as StartupSector,
      funding_stage: form.funding_stage as FundingStage,
      funding_goal: parseInt(form.funding_goal),
      min_investment: parseInt(form.min_investment) || 500,
      website_url: form.website_url.trim() || null,
      location: form.location.trim() || null,
      founded_year: form.founded_year ? parseInt(form.founded_year) : null,
      team_size: form.team_size ? parseInt(form.team_size) : null,
      valuation: form.valuation ? parseInt(form.valuation) : null,
      total_shares: form.total_shares ? parseInt(form.total_shares) : null,
      verification_status: 'pending',
    });

    setLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message,
      });
    } else {
      setSubmitted(true);
    }
  };

  if (authLoading || checkingExisting) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-lg text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Clock className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-3">Registration Submitted!</h1>
          <p className="text-muted-foreground text-lg mb-2">
            Your startup <span className="font-semibold text-foreground">{form.name}</span> has been registered successfully.
          </p>
          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="text-left">
                  <p className="font-medium text-sm">Pending Verification</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your startup will be <strong>live once verified by our team</strong>. This usually takes 1-2 business days. 
                    You'll be notified once your startup is approved and visible to investors.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button className="mt-8" onClick={() => navigate('/startup-dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Rocket className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold">Register Your Startup</h1>
          <p className="text-muted-foreground mt-2">Fill in the details below. Your startup will go live once verified by our team.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
              <CardDescription>Tell us about your startup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Startup Name *</Label>
                <Input id="name" placeholder="e.g. GreenLeaf Technologies" value={form.name} onChange={e => handleChange('name', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline *</Label>
                <Input id="tagline" placeholder="A short description in one line" value={form.tagline} onChange={e => handleChange('tagline', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" placeholder="Describe your startup, what problem it solves, and your vision..." rows={4} value={form.description} onChange={e => handleChange('description', e.target.value)} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector *</Label>
                  <Select value={form.sector} onValueChange={v => handleChange('sector', v)}>
                    <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(SECTOR_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="funding_stage">Funding Stage</Label>
                  <Select value={form.funding_stage} onValueChange={v => handleChange('funding_stage', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(FUNDING_STAGE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Funding Details
              </CardTitle>
              <CardDescription>How much are you looking to raise?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="funding_goal">Funding Goal (₹) *</Label>
                  <Input id="funding_goal" type="number" placeholder="e.g. 5000000" value={form.funding_goal} onChange={e => handleChange('funding_goal', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_investment">Min Investment (₹)</Label>
                  <Input id="min_investment" type="number" placeholder="500" value={form.min_investment} onChange={e => handleChange('min_investment', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valuation">Valuation (₹)</Label>
                  <Input id="valuation" type="number" placeholder="e.g. 10000000" value={form.valuation} onChange={e => handleChange('valuation', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_shares">Total Shares</Label>
                  <Input id="total_shares" type="number" placeholder="1000000" value={form.total_shares} onChange={e => handleChange('total_shares', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Additional Details
              </CardTitle>
              <CardDescription>Optional but helps with verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website_url" className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Website</Label>
                  <Input id="website_url" type="url" placeholder="https://yoursite.com" value={form.website_url} onChange={e => handleChange('website_url', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Location</Label>
                  <Input id="location" placeholder="e.g. Mumbai, India" value={form.location} onChange={e => handleChange('location', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="founded_year" className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Founded Year</Label>
                  <Input id="founded_year" type="number" placeholder="e.g. 2023" value={form.founded_year} onChange={e => handleChange('founded_year', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team_size" className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Team Size</Label>
                  <Input id="team_size" type="number" placeholder="e.g. 10" value={form.team_size} onChange={e => handleChange('team_size', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">* Required fields</p>
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Submit for Verification
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
