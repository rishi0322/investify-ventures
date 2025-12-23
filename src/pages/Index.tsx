import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  TrendingUp, 
  Shield, 
  Users, 
  Rocket, 
  ArrowRight, 
  CheckCircle2,
  Building2,
  PiggyBank,
  BarChart3
} from 'lucide-react';
import { SECTOR_LABELS, SECTOR_ICONS, StartupSector } from '@/types/database';

const FEATURED_SECTORS: StartupSector[] = ['technology', 'fintech', 'healthcare', 'green_energy', 'edtech', 'ecommerce'];

const STATS = [
  { value: '₹10Cr+', label: 'Total Investments' },
  { value: '150+', label: 'Startups Funded' },
  { value: '25,000+', label: 'Active Investors' },
  { value: '12', label: 'Sectors Covered' },
];

const HOW_IT_WORKS = [
  {
    icon: Users,
    title: 'Create Account',
    description: 'Sign up as an investor or startup founder in minutes.',
  },
  {
    icon: Building2,
    title: 'Explore Startups',
    description: 'Browse verified startups across various sectors.',
  },
  {
    icon: PiggyBank,
    title: 'Invest Smart',
    description: 'Start investing with as little as ₹500.',
  },
  {
    icon: BarChart3,
    title: 'Track Growth',
    description: 'Monitor your investments and portfolio performance.',
  },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-20 lg:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-up">
              <Rocket className="h-4 w-4" />
              <span>Democratizing Startup Investments</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Invest in the Future of{' '}
              <span className="text-gradient">Indian Startups</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Connect with verified startups, explore their pitches, and build your investment portfolio starting at just ₹500. Join thousands of investors shaping India's startup ecosystem.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Button size="lg" asChild className="shadow-primary">
                <Link to="/startups">
                  Explore Startups
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth?mode=signup&role=startup">
                  List Your Startup
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center animate-fade-up" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sectors */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Invest by Sector
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from 12 high-growth sectors and invest in startups that align with your interests and expertise.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {FEATURED_SECTORS.map((sector, index) => (
              <Link
                key={sector}
                to={`/startups?sector=${sector}`}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Card className="hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {SECTOR_ICONS[sector]}
                    </div>
                    <h3 className="font-semibold text-sm">{SECTOR_LABELS[sector]}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/sectors">
                View All Sectors
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              How Investify Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Start your investment journey in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, index) => (
              <Card 
                key={step.title} 
                className="relative overflow-hidden animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="absolute top-4 right-4 text-6xl font-display font-bold text-muted/30">
                    {index + 1}
                  </div>
                  <div className="gradient-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <step.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Investify */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Why Choose Investify?
              </h2>
              <p className="text-muted-foreground mb-8">
                We've built a platform that prioritizes security, transparency, and accessibility for both investors and startups.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Shield, title: 'Verified Startups', description: 'Every startup goes through our rigorous verification process' },
                  { icon: TrendingUp, title: 'Low Minimum Investment', description: 'Start investing with as little as ₹500' },
                  { icon: Users, title: 'Expert Curation', description: 'Our team curates only the most promising startups' },
                ].map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 gradient-primary rounded-3xl opacity-10 blur-3xl" />
              <Card className="relative overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="font-display font-bold text-2xl mb-6">For Startups</h3>
                  <ul className="space-y-3">
                    {[
                      'Reach thousands of potential investors',
                      'Showcase your pitch with video and deck',
                      'Get verified for credibility',
                      'Track your funding progress in real-time',
                      'Connect with industry-specific investors',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" asChild>
                    <Link to="/auth?mode=signup&role=startup">
                      Register Your Startup
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
            Ready to Start Investing?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join Investify today and be part of India's most exciting startup investment platform.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/auth?mode=signup">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
