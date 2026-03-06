import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Startup, FUNDING_STAGE_LABELS } from '@/types/database';
import { CheckCircle2, Circle, Lock, Rocket, Target, Trophy, Users, Zap, ArrowRight } from 'lucide-react';

interface Props {
  startup: Startup;
  investments: any[];
}

interface Milestone {
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  icon: React.ElementType;
  unlocked: boolean;
}

export function StartupMilestones({ startup, investments }: Props) {
  const totalRaised = investments.reduce((s, i) => s + i.amount, 0);
  const investorCount = new Set(investments.map(i => i.investor_id)).size;

  const milestones: Milestone[] = [
    {
      title: 'First Investment',
      description: 'Receive your first investment from the platform',
      target: 1,
      current: Math.min(investments.length, 1),
      unit: 'investment',
      icon: Zap,
      unlocked: investments.length >= 1,
    },
    {
      title: '5 Investors',
      description: 'Build trust with 5 unique investors',
      target: 5,
      current: Math.min(investorCount, 5),
      unit: 'investors',
      icon: Users,
      unlocked: investorCount >= 5,
    },
    {
      title: '₹1 Lakh Raised',
      description: 'Cross the ₹1,00,000 fundraising mark',
      target: 100000,
      current: Math.min(totalRaised, 100000),
      unit: '₹',
      icon: Target,
      unlocked: totalRaised >= 100000,
    },
    {
      title: '25% Funded',
      description: 'Reach 25% of your funding goal',
      target: startup.funding_goal * 0.25,
      current: Math.min(totalRaised, startup.funding_goal * 0.25),
      unit: '₹',
      icon: Rocket,
      unlocked: totalRaised >= startup.funding_goal * 0.25,
    },
    {
      title: '10 Investors',
      description: 'Build a strong base of 10 investors',
      target: 10,
      current: Math.min(investorCount, 10),
      unit: 'investors',
      icon: Users,
      unlocked: investorCount >= 10,
    },
    {
      title: '50% Funded',
      description: 'Halfway to your funding goal!',
      target: startup.funding_goal * 0.5,
      current: Math.min(totalRaised, startup.funding_goal * 0.5),
      unit: '₹',
      icon: Trophy,
      unlocked: totalRaised >= startup.funding_goal * 0.5,
    },
    {
      title: '₹10 Lakh Raised',
      description: 'Cross the ₹10,00,000 fundraising milestone',
      target: 1000000,
      current: Math.min(totalRaised, 1000000),
      unit: '₹',
      icon: Trophy,
      unlocked: totalRaised >= 1000000,
    },
    {
      title: 'Fully Funded',
      description: `Reach your full funding goal of ₹${startup.funding_goal.toLocaleString('en-IN')}`,
      target: startup.funding_goal,
      current: Math.min(totalRaised, startup.funding_goal),
      unit: '₹',
      icon: Trophy,
      unlocked: totalRaised >= startup.funding_goal,
    },
  ];

  const unlockedCount = milestones.filter(m => m.unlocked).length;

  // Quick tips
  const tips = [
    { text: 'Complete your profile to 100% — verified startups get 3x more views', done: !!startup.website_url && !!startup.pitch_deck_url },
    { text: 'Add a pitch video — startups with videos get 45% more investments', done: !!startup.pitch_video_url },
    { text: 'Lower your minimum investment to attract more retail investors', done: startup.min_investment <= 1000 },
    { text: 'Use AI Matchmaking to find investors in your sector', done: false },
    { text: 'Update your description regularly with traction and milestones', done: startup.description.length > 200 },
    { text: 'Respond to investor messages within 24 hours for better engagement', done: true },
  ];

  return (
    <div className="space-y-6">
      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Funding Milestones
          </CardTitle>
          <CardDescription>
            {unlockedCount}/{milestones.length} milestones achieved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {milestones.map((milestone, index) => {
              const progress = milestone.target > 0 ? (milestone.current / milestone.target) * 100 : 0;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                    milestone.unlocked
                      ? 'border-success/20 bg-success/5'
                      : 'border-border/50 bg-muted/10'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    milestone.unlocked ? 'bg-success/10' : 'bg-muted'
                  }`}>
                    {milestone.unlocked ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <milestone.icon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold">{milestone.title}</h4>
                      {milestone.unlocked && (
                        <Badge className="bg-success/10 text-success border-success/20 text-[10px] px-1.5 py-0">
                          ✓ Unlocked
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{milestone.description}</p>
                    {!milestone.unlocked && (
                      <div className="w-full bg-muted rounded-full h-1.5 mt-1.5">
                        <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                    )}
                  </div>
                  {!milestone.unlocked && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {Math.round(progress)}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Growth Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" />
            Growth Tips
          </CardTitle>
          <CardDescription>Actionable suggestions to boost your startup's visibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {tips.map((tip, index) => (
            <div key={index} className={`flex items-start gap-3 p-2.5 rounded-lg ${tip.done ? 'opacity-50' : ''}`}>
              {tip.done ? (
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
              ) : (
                <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              )}
              <p className={`text-sm ${tip.done ? 'line-through text-muted-foreground' : ''}`}>{tip.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
