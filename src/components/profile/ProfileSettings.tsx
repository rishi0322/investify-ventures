import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProfileAvatar } from './ProfileAvatar';
import { User, Mail, Phone, Calendar, Shield, Loader2, Save } from 'lucide-react';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  phone: z.string().regex(/^[0-9]{10,15}$/, 'Phone must be 10-15 digits').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSettingsProps {
  userId: string;
}

interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
}

export function ProfileSettings({ userId }: ProfileSettingsProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      phone: '',
    },
  });

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error loading profile',
        description: error.message,
      });
    } else if (data) {
      setProfile(data);
      setAvatarUrl(data.avatar_url);
      form.reset({
        full_name: data.full_name || '',
        phone: data.phone || '',
      });
    }
    setLoading(false);
  };

  const onSubmit = async (formData: ProfileFormData) => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone || null,
      })
      .eq('id', userId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to update profile',
        description: error.message,
      });
    } else {
      toast({
        title: 'Profile updated!',
        description: 'Your changes have been saved.',
      });
      setProfile((prev) => prev ? { ...prev, full_name: formData.full_name, phone: formData.phone || null } : null);
    }
    setSaving(false);
  };

  const handleAvatarChange = (newUrl: string) => {
    setAvatarUrl(newUrl);
    setProfile((prev) => prev ? { ...prev, avatar_url: newUrl } : null);
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 mt-4" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Profile Card */}
      <Card className="md:col-span-1">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <ProfileAvatar
            userId={userId}
            avatarUrl={avatarUrl}
            fullName={profile?.full_name || 'User'}
            size="lg"
            editable={true}
            onAvatarChange={handleAvatarChange}
          />
          <h3 className="text-xl font-semibold mt-4">
            {profile?.full_name || 'Your Name'}
          </h3>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
          
          <div className="mt-6 w-full space-y-3">
            <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role
              </span>
              <Badge variant="secondary">Investor</Badge>
            </div>
            <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Member since
              </span>
              <span className="font-medium">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('en-IN', {
                      month: 'short',
                      year: 'numeric',
                    })
                  : '-'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Update your profile details. Your email cannot be changed here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </FormLabel>
                <Input
                  value={profile?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email changes require re-authentication
                </p>
              </FormItem>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
