import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Startup, SECTOR_LABELS, FUNDING_STAGE_LABELS, SECTOR_ICONS } from '@/types/database';
import { TrendingUp, Users, MapPin, ArrowRight } from 'lucide-react';

interface StartupCardProps {
  startup: Startup;
}

export function StartupCard({ startup }: StartupCardProps) {
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
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 gradient-card border-border/50">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
            {startup.logo_url ? (
              <img 
                src={startup.logo_url} 
                alt={startup.name} 
                className="h-full w-full object-cover rounded-xl"
              />
            ) : (
              SECTOR_ICONS[startup.sector]
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-lg truncate">{startup.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{startup.tagline}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">
            {SECTOR_ICONS[startup.sector]} {SECTOR_LABELS[startup.sector]}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {FUNDING_STAGE_LABELS[startup.funding_stage]}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Raised</span>
            <span className="font-semibold text-accent">{formattedRaised}</span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress.toFixed(0)}% funded</span>
            <span>Goal: {formattedGoal}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>Min ₹{startup.min_investment}</span>
          </div>
          {startup.team_size && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{startup.team_size} team</span>
            </div>
          )}
          {startup.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="truncate max-w-[80px]">{startup.location}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full group/btn">
          <Link to={`/startups/${startup.id}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
