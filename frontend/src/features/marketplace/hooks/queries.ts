import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceApi } from '@/api/client';
import { MarketplaceItem, MarketplaceFilters } from '../types';

// Query Keys
export const marketplaceKeys = {
    all: ['marketplace'] as const,
    lists: () => [...marketplaceKeys.all, 'list'] as const,
    list: (filters: MarketplaceFilters) => [...marketplaceKeys.lists(), { filters }] as const,
    details: () => [...marketplaceKeys.all, 'detail'] as const,
    detail: (id: string | number) => [...marketplaceKeys.details(), id] as const,
};

// Query Hooks
export const useMarketplaceItemsQuery = (filters?: MarketplaceFilters) => {
    return useQuery({
        queryKey: filters ? marketplaceKeys.list(filters) : marketplaceKeys.lists(),
        queryFn: marketplaceApi.getAll,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
    });
};

export const useMarketplaceItemQuery = (id: string | number) => {
    return useQuery({
        queryKey: marketplaceKeys.detail(id),
        queryFn: () => marketplaceApi.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
};

// Mutation Hooks
export const useCreateMarketplaceItemMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: marketplaceApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: marketplaceKeys.lists() });
        },
        onError: (error) => {
            console.error('Failed to create marketplace item:', error);
        },
    });
};

export const useUpdateMarketplaceItemMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<MarketplaceItem> }) =>
            marketplaceApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: marketplaceKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: marketplaceKeys.lists() });
        },
        onError: (error) => {
            console.error('Failed to update marketplace item:', error);
        },
    });
};

export const useDeleteMarketplaceItemMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: marketplaceApi.delete,
        onSuccess: (_, id) => {
            queryClient.removeQueries({ queryKey: marketplaceKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: marketplaceKeys.lists() });
        },
        onError: (error) => {
            console.error('Failed to delete marketplace item:', error);
        },
    });
};