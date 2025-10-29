import { enhancedApiClient } from '../enhancedClient';
import { MarketplaceItem } from '@/features/marketplace/types';

// Additional types for API responses
export interface CreateMarketplaceItemData {
    title: string;
    description: string;
    price: number;
    type: string;
    category: string;
    condition: string;
    image?: string;
}

export interface UpdateMarketplaceItemData extends Partial<CreateMarketplaceItemData> { }

export interface MarketplaceFilters {
    search?: string;
    category?: string;
    type?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    sellerId?: number;
}

// Marketplace API Service
export const marketplaceService = {
    // Get all marketplace items
    getAll: (filters?: MarketplaceFilters): Promise<MarketplaceItem[]> => {
        const queryParams = filters ? new URLSearchParams(
            Object.entries(filters)
                .filter(([_, value]) => value !== undefined && value !== '')
                .map(([key, value]) => [key, String(value)])
        ).toString() : '';

        const endpoint = queryParams ? `/marketplace?${queryParams}` : '/marketplace';
        return enhancedApiClient.get<MarketplaceItem[]>(endpoint);
    },

    // Get marketplace item by ID
    getById: (id: string | number): Promise<MarketplaceItem> => {
        return enhancedApiClient.get<MarketplaceItem>(`/marketplace/${id}`);
    },

    // Create new marketplace item
    create: (data: CreateMarketplaceItemData): Promise<MarketplaceItem> => {
        return enhancedApiClient.post<MarketplaceItem>('/marketplace', data);
    },

    // Update marketplace item
    update: (id: string | number, data: UpdateMarketplaceItemData): Promise<MarketplaceItem> => {
        return enhancedApiClient.put<MarketplaceItem>(`/marketplace/${id}`, data);
    },

    // Delete marketplace item
    delete: (id: string | number): Promise<void> => {
        return enhancedApiClient.delete<void>(`/marketplace/${id}`);
    },

    // Get items by seller
    getBySeller: (sellerId: number): Promise<MarketplaceItem[]> => {
        return enhancedApiClient.get<MarketplaceItem[]>(`/marketplace/seller/${sellerId}`);
    },

    // Search marketplace items
    search: (query: string): Promise<MarketplaceItem[]> => {
        return enhancedApiClient.get<MarketplaceItem[]>(`/marketplace/search?q=${encodeURIComponent(query)}`);
    },

    // Get marketplace categories
    getCategories: (): Promise<string[]> => {
        return enhancedApiClient.get<string[]>('/marketplace/categories');
    },

    // Get marketplace item types
    getTypes: (): Promise<string[]> => {
        return enhancedApiClient.get<string[]>('/marketplace/types');
    },

    // Mark item as sold
    markAsSold: (id: string | number): Promise<MarketplaceItem> => {
        return enhancedApiClient.patch<MarketplaceItem>(`/marketplace/${id}/sold`);
    },

    // Mark item as available
    markAsAvailable: (id: string | number): Promise<MarketplaceItem> => {
        return enhancedApiClient.patch<MarketplaceItem>(`/marketplace/${id}/available`);
    },

    // Favorite/unfavorite item
    toggleFavorite: (id: string | number): Promise<{ favorited: boolean }> => {
        return enhancedApiClient.post(`/marketplace/${id}/favorite`);
    },

    // Get user's favorite items
    getFavorites: (): Promise<MarketplaceItem[]> => {
        return enhancedApiClient.get<MarketplaceItem[]>('/marketplace/favorites');
    },
};