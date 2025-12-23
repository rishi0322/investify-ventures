import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  UserPlus, 
  Search, 
  CreditCard, 
  BarChart3, 
  Shield, 
  CheckCircle2,
  ArrowRight,
  Building2,
  FileText,
  Users
} from 'lucide-react';

const INVESTOR_STEPS = [
  {
    icon: UserPlus,
    title: 'Create an Account',
    description: 'Sign up for free in under 2 minutes. Verify your email and complete your investor profile.',
  },
  {
    icon: Search,
    title: 'Explore Startups',
    description: 'Browse through verified startups across 12 sectors. Watch pitch videos and review business plans.',
  },
  {
    icon: CreditCard,
    title: 'Make an Investment',
    description: 'Choose a startup you believe in. Invest as little as ₹500 using secure payment methods.',
  },
  {
    icon: BarChart3,
    title: 'Track Your Portfolio',
    description: 'Monitor your investments through your dashboard. Get updates on startup progress.',
  },
];

const STARTUP_STEPS = [
  {
    icon: UserPlus,
    title: 'Register as a Startup',
    description: 'Create your founder account and tell us about your company.',
  },
  {
    icon: FileText,
    title: 'Submit Your Pitch',
    description: 'Upload your pitch deck, video, and provide details about your funding goals.',
  },
  {
    icon: Shield,
    title: 'Get Verified',
    description: 'Our team reviews your application to ensure authenticity and potential.',
  },
  {
    icon: Users,
    title: 'Connect with Investors',
    description: 'Once approved, your startup is visible to thousands of potential investors.',
  },
];

export default function HowItWorks() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            How Investify Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether you're an investor looking for opportunities or a startup seeking funding, we've made the process simple and secure.
          </p>
        </div>

        {/* For Investors */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold mb-2">For Investors</h2>
            <p className="text-muted-foreground">Start investing in promising startups in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {INVESTOR_STEPS.map((step, index) => (
              <Card 
                key={step.title} 
                className="relative overflow-hidden animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="absolute top-4 right-4 text-6xl font-display font-bold text-muted/20">
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

          <div className="text-center mt-8">
            <Button size="lg" asChild>
              <Link to="/auth?mode=signup">
                Start Investing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* For Startups */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold mb-2">For Startups</h2>
            <p className="text-muted-foreground">Get funded by a community of investors who believe in your vision</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STARTUP_STEPS.map((step, index) => (
              <Card 
                key={step.title} 
                className="relative overflow-hidden animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="absolute top-4 right-4 text-6xl font-display font-bold text-muted/20">
                    {index + 1}
                  </div>
                  <div className="gradient-accent w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <step.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth?mode=signup&role=startup">
                <Building2 className="mr-2 h-5 w-5" />
                Register Your Startup
              </Link>
            </Button>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-muted/50 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold mb-2">Why Choose Investify?</h2>
            <p className="text-muted-foreground">Built for trust, transparency, and success</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Verified Startups Only',
                description: 'Every startup goes through our rigorous verification process before being listed.',
              },
              {
                icon: CreditCard,
                title: 'Low Minimum Investment',
                description: 'Start your investment journey with as little as ₹500. Build your portfolio gradually.',
              },
              {
                icon: CheckCircle2,
                title: 'Secure Transactions',
                description: 'Bank-grade security for all transactions. Your investments are protected.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
