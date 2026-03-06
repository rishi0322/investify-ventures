import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Startup } from '@/types/database';
import { Shield, CheckCircle2, Clock, XCircle, FileText, Video, Globe, Users, MapPin, Calendar } from 'lucide-react';

interface Props {
  startup: Startup;
}

export function StartupVerificationStatus({ startup }: Props) {
  const status = startup.verification_status;

  const checks = [
    { label: 'Company Name', done: !!startup.name, icon: FileText },
    { label: 'Description', done: startup.description.length > 50, icon: FileText },
    { label: 'Pitch Video', done: !!startup.pitch_video_url, icon: Video },
    { label: 'Pitch Deck', done: !!startup.pitch_deck_url, icon: FileText },
    { label: 'Website', done: !!startup.website_url, icon: Globe },
    { label: 'Team Size', done: !!startup.team_size, icon: Users },
    { label: 'Location', done: !!startup.location, icon: MapPin },
    { label: 'Founded Year', done: !!startup.founded_year, icon: Calendar },
  ];

  const completedCount = checks.filter(c => c.done).length;
  const progress = Math.round((completedCount / checks.length) * 100);

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Card className={
        status === 'approved'
          ? 'border-success/30 bg-success/5'
          : status === 'rejected'
          ? 'border-destructive/30 bg-destructive/5'
          : 'border-warning/30 bg-warning/5'
      }>
        <CardContent className="p-6 flex items-center gap-4">
          {status === 'approved' ? (
            <CheckCircle2 className="h-10 w-10 text-success" />
          ) : status === 'rejected' ? (
            <XCircle className="h-10 w-10 text-destructive" />
          ) : (
            <Clock className="h-10 w-10 text-warning" />
          )}
          <div>
            <h3 className="text-lg font-bold">
              {status === 'approved' ? 'Startup Verified' : status === 'rejected' ? 'Verification Rejected' : 'Verification Pending'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {status === 'approved'
                ? `Verified on ${startup.verified_at ? new Date(startup.verified_at).toLocaleDateString() : 'N/A'}. Your startup is visible to investors.`
                : status === 'rejected'
                ? `Reason: ${startup.rejection_reason || 'No reason provided'}. Please update your details and resubmit.`
                : 'Our team is reviewing your startup. This usually takes 2-3 business days.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Completeness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Profile Completeness
          </CardTitle>
          <CardDescription>Complete your profile to improve verification chances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{completedCount}/{checks.length} items completed</span>
              <Badge variant={progress === 100 ? 'default' : 'secondary'}>{progress}%</Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {checks.map((check) => (
              <div key={check.label} className={`flex items-center gap-3 p-3 rounded-lg border ${check.done ? 'border-success/20 bg-success/5' : 'border-border'}`}>
                <check.icon className={`h-4 w-4 ${check.done ? 'text-success' : 'text-muted-foreground'}`} />
                <span className="text-sm flex-1">{check.label}</span>
                {check.done ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
