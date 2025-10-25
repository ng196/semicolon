import { MarketplaceItem } from '../types';
import MarketplaceItemCard from './MarketplaceItemCard';

interface MarketplaceGridProps {
  items: MarketplaceItem[];
  onItemClick: (item: MarketplaceItem) => void;
  onContact: (item: MarketplaceItem) => void;
  onFavorite: (item: MarketplaceItem) => void;
}

export default function MarketplaceGrid({
  items,
  onItemClick,
  onContact,
  onFavorite,
}: MarketplaceGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No items found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <MarketplaceItemCard
          key={item.id}
          item={item}
          onClick={onItemClick}
          onContact={onContact}
          onFavorite={onFavorite}
        />
      ))}
    </div>
  );
}
