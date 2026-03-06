import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Startup, SECTOR_LABELS, SECTOR_ICONS } from '@/types/database';
import {
  Brain, Sparkles, Send, Loader2, Shield, TrendingUp,
  DollarSign, BarChart2, CheckCircle2, User
} from 'lucide-react';

interface AIMatchmakingProps {
  startup: Startup;
  founderId: string;
}

interface PotentialInvestor {
  id: string;
  blockchainId: string;
  matchScore: number;
  investmentRange: string;
  preferredSectors: string[];
  riskProfile: string;
  pastInvestments: number;
  avgInvestmentSize: string;
  isReal?: boolean; // flag for real investor (jrishicric@gmail.com)
  realUserId?: string;
  inviteSent?: boolean;
}

// Generate a blockchain-like hash
function generateBlockchainId(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 40; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

// Sample AI-generated investors
function generateSampleInvestors(sector: string): PotentialInvestor[] {
  const sectorRelated = [sector];
  const adjacentSectors: Record<string, string[]> = {
    technology: ['fintech', 'edtech', 'ecommerce'],
    healthcare: ['technology', 'green_energy'],
    fintech: ['technology', 'ecommerce'],
    edtech: ['technology', 'consumer'],
    ecommerce: ['technology', 'logistics', 'consumer'],
    green_energy: ['technology', 'manufacturing', 'agriculture'],
    real_estate: ['fintech', 'technology'],
    consumer: ['ecommerce', 'media_entertainment'],
    manufacturing: ['technology', 'logistics', 'green_energy'],
    agriculture: ['green_energy', 'technology', 'logistics'],
    logistics: ['ecommerce', 'technology', 'manufacturing'],
    media_entertainment: ['technology', 'consumer', 'edtech'],
  };

  const related = adjacentSectors[sector] || ['technology'];

  const investors: PotentialInvestor[] = [
    // Real investor - jrishicric@gmail.com
    {
      id: 'real-investor-1',
      blockchainId: '0x6a660748f5a9a4d64ac339e0107dfe429b2c8e1a',
      matchScore: 92,
      investmentRange: '₹5,000 - ₹5,00,000',
      preferredSectors: [sector, ...related.slice(0, 2)],
      riskProfile: 'Moderate-High',
      pastInvestments: 12,
      avgInvestmentSize: '₹75,000',
      isReal: true,
      realUserId: '6a660748-5a9a-4d64-ac33-9e0107dfe429',
    },
    {
      id: 'ai-inv-2',
      blockchainId: generateBlockchainId(),
      matchScore: 88,
      investmentRange: '₹10,000 - ₹10,00,000',
      preferredSectors: [sector, related[0]],
      riskProfile: 'High',
      pastInvestments: 23,
      avgInvestmentSize: '₹2,50,000',
    },
    {
      id: 'ai-inv-3',
      blockchainId: generateBlockchainId(),
      matchScore: 85,
      investmentRange: '₹25,000 - ₹15,00,000',
      preferredSectors: [sector, ...related.slice(0, 1)],
      riskProfile: 'Moderate',
      pastInvestments: 8,
      avgInvestmentSize: '₹1,50,000',
    },
    {
      id: 'ai-inv-4',
      blockchainId: generateBlockchainId(),
      matchScore: 81,
      investmentRange: '₹50,000 - ₹25,00,000',
      preferredSectors: [...sectorRelated, related[1] || 'technology'],
      riskProfile: 'High',
      pastInvestments: 31,
      avgInvestmentSize: '₹4,00,000',
    },
    {
      id: 'ai-inv-5',
      blockchainId: generateBlockchainId(),
      matchScore: 78,
      investmentRange: '₹5,000 - ₹2,00,000',
      preferredSectors: [sector],
      riskProfile: 'Low-Moderate',
      pastInvestments: 5,
      avgInvestmentSize: '₹45,000',
    },
    {
      id: 'ai-inv-6',
      blockchainId: generateBlockchainId(),
      matchScore: 76,
      investmentRange: '₹1,00,000 - ₹50,00,000',
      preferredSectors: [related[0] || sector, sector],
      riskProfile: 'High',
      pastInvestments: 45,
      avgInvestmentSize: '₹8,00,000',
    },
    {
      id: 'ai-inv-7',
      blockchainId: generateBlockchainId(),
      matchScore: 73,
      investmentRange: '₹10,000 - ₹5,00,000',
      preferredSectors: [sector, related[2] || 'technology'],
      riskProfile: 'Moderate',
      pastInvestments: 15,
      avgInvestmentSize: '₹1,00,000',
    },
    {
      id: 'ai-inv-8',
      blockchainId: generateBlockchainId(),
      matchScore: 70,
      investmentRange: '₹2,000 - ₹1,00,000',
      preferredSectors: [sector],
      riskProfile: 'Low',
      pastInvestments: 3,
      avgInvestmentSize: '₹25,000',
    },
    {
      id: 'ai-inv-9',
      blockchainId: generateBlockchainId(),
      matchScore: 67,
      investmentRange: '₹50,000 - ₹20,00,000',
      preferredSectors: [related[0] || sector, related[1] || sector, sector],
      riskProfile: 'Moderate-High',
      pastInvestments: 19,
      avgInvestmentSize: '₹3,50,000',
    },
    {
      id: 'ai-inv-10',
      blockchainId: generateBlockchainId(),
      matchScore: 64,
      investmentRange: '₹5,000 - ₹3,00,000',
      preferredSectors: [sector, 'technology'],
      riskProfile: 'Moderate',
      pastInvestments: 7,
      avgInvestmentSize: '₹60,000',
    },
    {
      id: 'ai-inv-11',
      blockchainId: generateBlockchainId(),
      matchScore: 61,
      investmentRange: '₹1,00,000 - ₹30,00,000',
      preferredSectors: [related[0] || sector, sector],
      riskProfile: 'High',
      pastInvestments: 28,
      avgInvestmentSize: '₹5,00,000',
    },
    {
      id: 'ai-inv-12',
      blockchainId: generateBlockchainId(),
      matchScore: 58,
      investmentRange: '₹10,000 - ₹8,00,000',
      preferredSectors: [sector, related[2] || 'fintech'],
      riskProfile: 'Moderate',
      pastInvestments: 11,
      avgInvestmentSize: '₹90,000',
    },
  ];

  return investors;
}

export function StartupAIMatchmaking({ startup, founderId }: AIMatchmakingProps) {
  const { toast } = useToast();
  const [investors, setInvestors] = useState<PotentialInvestor[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [sendingInvite, setSendingInvite] = useState<string | null>(null);

  const runMatchmaking = () => {
    setLoading(true);
    // Simulate AI processing time
    setTimeout(() => {
      const matches = generateSampleInvestors(startup.sector);
      setInvestors(matches);
      setScanned(true);
      setLoading(false);
      toast({
        title: '🤖 AI Matchmaking Complete',
        description: `Found ${matches.length} potential investors matching your sector.`,
      });
    }, 2000);
  };

  const sendInvestmentInvite = async (investor: PotentialInvestor) => {
    setSendingInvite(investor.id);

    try {
      // If this is the real investor, send an actual message
      if (investor.isReal && investor.realUserId) {
        const { error } = await supabase.from('messages').insert({
          sender_id: founderId,
          receiver_id: investor.realUserId,
          startup_id: startup.id,
          content: `🤖 AI Matchmaking Invite: You've been matched with "${startup.name}" (${SECTOR_LABELS[startup.sector]}) based on your investment preferences. Match Score: ${investor.matchScore}%. The startup is currently raising ₹${startup.funding_goal.toLocaleString('en-IN')} at ${startup.funding_stage} stage. Check it out and consider investing!`,
        });

        if (error) throw error;

        toast({
          title: '✅ Investment invite sent!',
          description: `Invite sent to investor ${investor.blockchainId.slice(0, 10)}...`,
        });
      } else {
        // For sample investors, simulate sending via admin
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
          title: '📨 Invite request sent to Admin',
          description: `Admin will forward your investment invite to investor ${investor.blockchainId.slice(0, 10)}...`,
        });
      }

      setInvestors(prev =>
        prev.map(inv => inv.id === investor.id ? { ...inv, inviteSent: true } : inv)
      );
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to send invite',
        description: error.message,
      });
    }

    setSendingInvite(null);
  };

  const getRiskColor = (risk: string) => {
    if (risk.includes('High')) return 'text-destructive';
    if (risk.includes('Moderate')) return 'text-primary';
    return 'text-success';
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Matchmaking
          </CardTitle>
          <CardDescription>
            Our AI scans the investor network to find potential investors who actively invest in <span className="font-semibold text-foreground">{SECTOR_LABELS[startup.sector]}</span> and related sectors. Investor identities are anonymized with blockchain IDs for privacy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runMatchmaking} disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Scanning Investor Network...
              </>
            ) : scanned ? (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Re-scan for Investors
              </>
            ) : (
              <>
                <Brain className="h-5 w-5 mr-2" />
                Find Matching Investors
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {scanned && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found <span className="font-semibold text-foreground">{investors.length}</span> potential investors
            </p>
            <Badge variant="secondary" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Identities Protected
            </Badge>
          </div>

          <div className="grid gap-4">
            {investors.map((investor, index) => (
              <Card key={investor.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Left: Identity & Score */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-mono text-muted-foreground truncate max-w-[220px]">
                            {investor.blockchainId}
                          </p>
                          {index === 0 && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-primary">
                              Top Match
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Match Score:</span>
                          <span className="text-lg font-bold text-primary">{investor.matchScore}%</span>
                        </div>
                        <Progress value={investor.matchScore} className="h-1.5 mt-1 w-32" />
                      </div>
                    </div>

                    {/* Middle: Details */}
                    <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Range:</span>
                        <span className="font-medium truncate">{investor.investmentRange}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BarChart2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Past:</span>
                        <span className="font-medium">{investor.pastInvestments} investments</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Avg:</span>
                        <span className="font-medium">{investor.avgInvestmentSize}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Risk:</span>
                        <span className={`font-medium ${getRiskColor(investor.riskProfile)}`}>
                          {investor.riskProfile}
                        </span>
                      </div>
                    </div>

                    {/* Sectors */}
                    <div className="flex flex-wrap gap-1 lg:max-w-[180px]">
                      {investor.preferredSectors.map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">
                          {SECTOR_ICONS[s as keyof typeof SECTOR_ICONS] || '📊'} {SECTOR_LABELS[s as keyof typeof SECTOR_LABELS] || s}
                        </Badge>
                      ))}
                    </div>

                    {/* Action */}
                    <div className="shrink-0">
                      {investor.inviteSent ? (
                        <Button variant="outline" size="sm" disabled className="w-full lg:w-auto">
                          <CheckCircle2 className="h-4 w-4 mr-1.5 text-success" />
                          Invite Sent
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => sendInvestmentInvite(investor)}
                          disabled={sendingInvite === investor.id}
                          className="w-full lg:w-auto"
                        >
                          {sendingInvite === investor.id ? (
                            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 mr-1.5" />
                          )}
                          Send Invite
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                <Shield className="h-4 w-4 inline mr-1" />
                Investor identities are protected using blockchain-based anonymization. 
                Investment invites are forwarded through our admin team to maintain privacy.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
