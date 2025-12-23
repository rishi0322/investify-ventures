import { StartupSector, SECTOR_LABELS, SECTOR_ICONS } from '@/types/database';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SectorFilterProps {
  selected: StartupSector | null;
  onSelect: (sector: StartupSector | null) => void;
}

const SECTORS: StartupSector[] = [
  'technology',
  'healthcare',
  'fintech',
  'edtech',
  'ecommerce',
  'green_energy',
  'real_estate',
  'consumer',
  'manufacturing',
  'agriculture',
  'logistics',
  'media_entertainment',
];

export function SectorFilter({ selected, onSelect }: SectorFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selected === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelect(null)}
        className="rounded-full"
      >
        All Sectors
      </Button>
      {SECTORS.map((sector) => (
        <Button
          key={sector}
          variant={selected === sector ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect(sector)}
          className={cn(
            'rounded-full',
            selected === sector && 'shadow-primary'
          )}
        >
          <span className="mr-1">{SECTOR_ICONS[sector]}</span>
          {SECTOR_LABELS[sector]}
        </Button>
      ))}
    </div>
  );
}
