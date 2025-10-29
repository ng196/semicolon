import { useState, useMemo } from 'react';
import { MarketplaceItem, MarketplaceFilters } from '../types';

export const useMarketplaceFilters = (items: MarketplaceItem[]) => {
  const [filters, setFilters] = useState<MarketplaceFilters>({
    search: '',
    category: 'all',
    type: 'all',
    condition: 'all',
  });

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        filters.search === '' ||
        item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCategory =
        filters.category === 'all' || item.category === filters.category;

      const matchesType = filters.type === 'all' || item.type === filters.type;

      const matchesCondition =
        filters.condition === 'all' || item.condition === filters.condition;

      return matchesSearch && matchesCategory && matchesType && matchesCondition;
    });
  }, [items, filters]);

  const updateFilter = <K extends keyof MarketplaceFilters>(
    key: K,
    value: MarketplaceFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return {
    filters,
    filteredItems,
    updateFilter,
  };
};
