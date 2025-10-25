export interface MarketplaceItem {
  id: string | number;
  title: string;
  description: string;
  price: number;
  type: string;
  category: string;
  condition: string;
  image: string;
  seller_id: number;
  seller_name: string;
  seller_avatar: string;
  seller_rating?: number;
  liked?: number;
  posted_at: string;
  created_at?: string;
}

export interface MarketplaceFilters {
  search: string;
  category: string;
  type: string;
  condition: string;
}
