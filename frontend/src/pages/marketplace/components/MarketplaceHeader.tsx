import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MarketplaceHeaderProps {
  onCreateClick: () => void;
}

export default function MarketplaceHeader({ onCreateClick }: MarketplaceHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <p className="text-muted-foreground">
          Buy and sell items with your campus community
        </p>
      </div>
      <Button onClick={onCreateClick} className="gap-2">
        <Plus className="h-4 w-4" />
        List Item
      </Button>
    </div>
  );
}
