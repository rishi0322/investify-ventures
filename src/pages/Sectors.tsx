import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { SECTOR_LABELS, SECTOR_ICONS, StartupSector } from '@/types/database';

const SECTORS: { sector: StartupSector; count: number; description: string }[] = [
  { sector: 'technology', count: 24, description: 'Software, SaaS, and IT services' },
  { sector: 'healthcare', count: 18, description: 'Medical tech, pharma, and wellness' },
  { sector: 'fintech', count: 21, description: 'Payments, lending, and insurance' },
  { sector: 'edtech', count: 15, description: 'Learning platforms and ed-services' },
  { sector: 'ecommerce', count: 19, description: 'Online retail and D2C brands' },
  { sector: 'green_energy', count: 12, description: 'Solar, EV, and sustainability' },
  { sector: 'real_estate', count: 9, description: 'PropTech and construction' },
  { sector: 'consumer', count: 14, description: 'Consumer goods and services' },
  { sector: 'manufacturing', count: 8, description: 'Industrial and deep tech' },
  { sector: 'agriculture', count: 11, description: 'AgriTech and food processing' },
  { sector: 'logistics', count: 10, description: 'Supply chain and delivery' },
  { sector: 'media_entertainment', count: 7, description: 'Content and gaming' },
];

export default function Sectors() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-4">
            Investment Sectors
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore startups across 12 high-growth sectors. Choose your area of interest and find investment opportunities that match your expertise.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTORS.map((item, index) => (
            <Link
              key={item.sector}
              to={`/startups?sector=${item.sector}`}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl group-hover:scale-110 transition-transform">
                      {SECTOR_ICONS[item.sector]}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg mb-1">
                        {SECTOR_LABELS[item.sector]}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.description}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {item.count} startups →
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
