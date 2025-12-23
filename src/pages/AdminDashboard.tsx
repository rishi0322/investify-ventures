import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Startup, SECTOR_LABELS, FUNDING_STAGE_LABELS } from '@/types/database';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  Users,
  TrendingUp,
  ExternalLink,
  Loader2
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (user && role === 'admin') {
      fetchStartups();
    }
  }, [user, role]);

  const fetchStartups = async () => {
    const { data, error } = await supabase
      .from('startups')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setStartups(data as Startup[]);
    }
    setLoading(false);
  };

  const handleAction = (startup: Startup, action: 'approve' | 'reject') => {
    setSelectedStartup(startup);
    setDialogAction(action);
    setRejectionReason('');
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedStartup) return;
    setActionLoading(true);

    const updates: Partial<Startup> = {
      verification_status: dialogAction === 'approve' ? 'approved' : 'rejected',
      verified_at: new Date().toISOString(),
      verified_by: user?.id,
    };

    if (dialogAction === 'reject') {
      updates.rejection_reason = rejectionReason;
    }

    const { error } = await supabase
      .from('startups')
      .update(updates)
      .eq('id', selectedStartup.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } else {
      toast({
        title: dialogAction === 'approve' ? 'Startup approved' : 'Startup rejected',
        description: `${selectedStartup.name} has been ${dialogAction === 'approve' ? 'approved and is now live' : 'rejected'}.`,
      });
      fetchStartups();
    }

    setDialogOpen(false);
    setActionLoading(false);
  };

  const pendingStartups = startups.filter(s => s.verification_status === 'pending');
  const approvedStartups = startups.filter(s => s.verification_status === 'approved');
  const rejectedStartups = startups.filter(s => s.verification_status === 'rejected');

  const totalRaised = approvedStartups.reduce((sum, s) => sum + s.amount_raised, 0);

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  const StartupRow = ({ startup }: { startup: Startup }) => (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold truncate">{startup.name}</h4>
          <Badge variant="outline" className="shrink-0">
            {SECTOR_LABELS[startup.sector]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1">{startup.tagline}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>{FUNDING_STAGE_LABELS[startup.funding_stage]}</span>
          <span>Goal: ₹{startup.funding_goal.toLocaleString('en-IN')}</span>
          <span>Raised: ₹{startup.amount_raised.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {startup.website_url && (
          <Button variant="ghost" size="icon" asChild>
            <a href={startup.website_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
        {startup.verification_status === 'pending' && (
          <>
            <Button size="sm" onClick={() => handleAction(startup, 'approve')}>
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleAction(startup, 'reject')}>
              <XCircle className="mr-1 h-4 w-4" />
              Reject
            </Button>
          </>
        )}
        {startup.verification_status === 'approved' && (
          <Badge className="bg-success text-success-foreground">Approved</Badge>
        )}
        {startup.verification_status === 'rejected' && (
          <Badge variant="destructive">Rejected</Badge>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage startups and platform settings</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-warning" />
                <div>
                  <p className="text-2xl font-display font-bold">{pendingStartups.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-success" />
                <div>
                  <p className="text-2xl font-display font-bold">{approvedStartups.length}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-display font-bold">{startups.length}</p>
                  <p className="text-sm text-muted-foreground">Total Startups</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-2xl font-display font-bold">₹{(totalRaised / 100000).toFixed(1)}L</p>
                  <p className="text-sm text-muted-foreground">Total Raised</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Startups Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Startup Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending">
              <TabsList className="mb-4">
                <TabsTrigger value="pending">
                  Pending ({pendingStartups.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({approvedStartups.length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({rejectedStartups.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                {pendingStartups.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending startups to review
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingStartups.map(s => <StartupRow key={s.id} startup={s} />)}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="approved">
                {approvedStartups.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No approved startups yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {approvedStartups.map(s => <StartupRow key={s.id} startup={s} />)}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="rejected">
                {rejectedStartups.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No rejected startups
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rejectedStartups.map(s => <StartupRow key={s.id} startup={s} />)}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'approve' ? 'Approve Startup' : 'Reject Startup'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'approve'
                ? `Are you sure you want to approve "${selectedStartup?.name}"? It will become visible to investors.`
                : `Please provide a reason for rejecting "${selectedStartup?.name}".`}
            </DialogDescription>
          </DialogHeader>

          {dialogAction === 'reject' && (
            <Textarea
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={dialogAction === 'approve' ? 'default' : 'destructive'}
              onClick={confirmAction}
              disabled={actionLoading || (dialogAction === 'reject' && !rejectionReason)}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                dialogAction === 'approve' ? 'Approve' : 'Reject'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
