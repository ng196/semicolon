import { useState, useEffect } from 'react';
import { marketplaceApi } from '@/api/client';
import { MarketplaceItem } from '../types';

export const useMarketplaceItems = () => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await marketplaceApi.getAll();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load marketplace items');
    } finally {
      setLoading(false);
    }
  };

  return { items, loading, error, refetch: loadItems };
};
