import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useMarketplaceItems, useMarketplaceFilters } from '../hooks';
import { MarketplaceItem } from '../types';
import MarketplaceHeader from './MarketplaceHeader';
import MarketplaceFilters from './MarketplaceFilters';
import MarketplaceGrid from './MarketplaceGrid';
import MarketplaceItemDetailsModal from './MarketplaceItemDetailsModal';

export default function MarketplacePage() {
  const { items, loading, error } = useMarketplaceItems();
  const { filters, filteredItems, updateFilter } = useMarketplaceFilters(items);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);

  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category))],
    [items]
  );

  const types = useMemo(
    () => [...new Set(items.map((item) => item.type))],
    [items]
  );

  const conditions = useMemo(
    () => [...new Set(items.map((item) => item.condition))],
    [items]
  );

  const handleCreateItem = () => {
    // TODO: Implement create item modal
    console.log('Create item clicked');
  };

  const handleContactSeller = (item: MarketplaceItem) => {
    // TODO: Implement contact seller functionality
    console.log('Contact seller:', item.seller_name);
  };

  const handleFavoriteItem = (item: MarketplaceItem) => {
    // TODO: Implement favorite functionality
    console.log('Favorite item:', item.id);
  };

  const handleItemClick = (item: MarketplaceItem) => {
    setSelectedItem(item);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading marketplace...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <p className="text-muted-foreground">
          Failed to load marketplace items. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <MarketplaceHeader onCreateClick={handleCreateItem} />
        <MarketplaceFilters
          filters={filters}
          onFilterChange={updateFilter}
          categories={categories}
          types={types}
          conditions={conditions}
        />
        <MarketplaceGrid
          items={filteredItems}
          onItemClick={handleItemClick}
          onContact={handleContactSeller}
          onFavorite={handleFavoriteItem}
        />
        <MarketplaceItemDetailsModal
          item={selectedItem}
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onContact={handleContactSeller}
          onFavorite={handleFavoriteItem}
        />
      </div>
    </div>
  );
}
