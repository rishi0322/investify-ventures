import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { StartupCard } from '@/components/startup/StartupCard';
import { SectorFilter } from '@/components/startup/SectorFilter';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Startup, StartupSector, FundingStage, FUNDING_STAGE_LABELS } from '@/types/database';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function Startups() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState<StartupSector | null>(
    (searchParams.get('sector') as StartupSector) || null
  );
  const [selectedStage, setSelectedStage] = useState<FundingStage | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'most_funded' | 'most_progress'>('newest');

  useEffect(() => {
    fetchStartups();
  }, [selectedSector, selectedStage, sortBy]);

  useEffect(() => {
    if (selectedSector) {
      setSearchParams({ sector: selectedSector });
    } else {
      setSearchParams({});
    }
  }, [selectedSector, setSearchParams]);

  const fetchStartups = async () => {
    setLoading(true);
    let query = supabase
      .from('startups')
      .select('*')
      .eq('verification_status', 'approved');

    if (selectedSector) {
      query = query.eq('sector', selectedSector);
    }

    if (selectedStage !== 'all') {
      query = query.eq('funding_stage', selectedStage);
    }

    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'most_funded') {
      query = query.order('amount_raised', { ascending: false });
    }

    const { data, error } = await query;

    if (!error && data) {
      let filtered = data as Startup[];
      
      if (sortBy === 'most_progress') {
        filtered = filtered.sort((a, b) => {
          const progressA = (a.amount_raised / a.funding_goal) * 100;
          const progressB = (b.amount_raised / b.funding_goal) * 100;
          return progressB - progressA;
        });
      }

      setStartups(filtered);
    }
    setLoading(false);
  };

  const filteredStartups = startups.filter((startup) =>
    startup.name.toLowerCase().includes(search.toLowerCase()) ||
    startup.tagline.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            Browse Startups
          </h1>
          <p className="text-muted-foreground">
            Discover verified startups and find your next investment opportunity
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          <SectorFilter selected={selectedSector} onSelect={setSelectedSector} />

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search startups..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedStage} onValueChange={(value) => setSelectedStage(value as FundingStage | 'all')}>
                <SelectTrigger className="w-[140px]">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {Object.entries(FUNDING_STAGE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="most_funded">Most Funded</SelectItem>
                  <SelectItem value="most_progress">Most Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4 p-6 border rounded-lg">
                <Skeleton className="h-14 w-14 rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : filteredStartups.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredStartups.length} startup{filteredStartups.length !== 1 ? 's' : ''}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStartups.map((startup) => (
                <StartupCard key={startup.id} startup={startup} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No startups found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
