import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Startup, SECTOR_LABELS, FUNDING_STAGE_LABELS, StartupSector, FundingStage } from '@/types/database';
import { Save, Loader2 } from 'lucide-react';

interface Props {
  startup: Startup;
  onUpdate: (startup: Startup) => void;
}

export function StartupEditForm({ startup, onUpdate }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: startup.name,
    tagline: startup.tagline,
    description: startup.description,
    sector: startup.sector,
    funding_stage: startup.funding_stage,
    funding_goal: startup.funding_goal,
    min_investment: startup.min_investment,
    website_url: startup.website_url || '',
    location: startup.location || '',
    team_size: startup.team_size || 0,
    founded_year: startup.founded_year || new Date().getFullYear(),
    pitch_video_url: startup.pitch_video_url || '',
    pitch_deck_url: startup.pitch_deck_url || '',
  });

  const handleSave = async () => {
    setSaving(true);
    const { data, error } = await supabase
      .from('startups')
      .update({
        name: form.name,
        tagline: form.tagline,
        description: form.description,
        sector: form.sector,
        funding_stage: form.funding_stage,
        funding_goal: form.funding_goal,
        min_investment: form.min_investment,
        website_url: form.website_url || null,
        location: form.location || null,
        team_size: form.team_size || null,
        founded_year: form.founded_year || null,
        pitch_video_url: form.pitch_video_url || null,
        pitch_deck_url: form.pitch_deck_url || null,
      })
      .eq('id', startup.id)
      .select()
      .single();

    setSaving(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update startup details.' });
    } else {
      onUpdate(data as Startup);
      toast({ title: 'Success', description: 'Startup details updated successfully! Changes are live for investors.' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Startup Details</CardTitle>
        <CardDescription>Changes will be visible to investors immediately after saving</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Startup Name</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Sector</Label>
            <Select value={form.sector} onValueChange={(v) => setForm({ ...form, sector: v as StartupSector })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(SECTOR_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Funding Stage</Label>
            <Select value={form.funding_stage} onValueChange={(v) => setForm({ ...form, funding_stage: v as FundingStage })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(FUNDING_STAGE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Funding Goal (₹)</Label>
            <Input type="number" value={form.funding_goal} onChange={e => setForm({ ...form, funding_goal: Number(e.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label>Min Investment (₹)</Label>
            <Input type="number" value={form.min_investment} onChange={e => setForm({ ...form, min_investment: Number(e.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label>Team Size</Label>
            <Input type="number" value={form.team_size} onChange={e => setForm({ ...form, team_size: Number(e.target.value) })} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Location</Label>
            <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Founded Year</Label>
            <Input type="number" value={form.founded_year} onChange={e => setForm({ ...form, founded_year: Number(e.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label>Website URL</Label>
            <Input value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Pitch Video URL</Label>
            <Input value={form.pitch_video_url} onChange={e => setForm({ ...form, pitch_video_url: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Pitch Deck URL</Label>
            <Input value={form.pitch_deck_url} onChange={e => setForm({ ...form, pitch_deck_url: e.target.value })} />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}
