import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestsApi } from '@/api/client';

// Query Keys
export const requestKeys = {
    all: ['requests'] as const,
    lists: () => [...requestKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...requestKeys.lists(), { filters }] as const,
    details: () => [...requestKeys.all, 'detail'] as const,
    detail: (id: string | number) => [...requestKeys.details(), id] as const,
};

// Query Hooks
export const useRequestsQuery = () => {
    return useQuery({
        queryKey: requestKeys.lists(),
        queryFn: requestsApi.getAll,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
    });
};

export const useRequestQuery = (id: string | number) => {
    return useQuery({
        queryKey: requestKeys.detail(id),
        queryFn: () => requestsApi.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
};

// Mutation Hooks
export const useCreateRequestMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: requestsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
        },
        onError: (error) => {
            console.error('Failed to create request:', error);
        },
    });
};

export const useUpdateRequestMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: any }) =>
            requestsApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
        },
        onError: (error) => {
            console.error('Failed to update request:', error);
        },
    });
};

export const useDeleteRequestMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: requestsApi.delete,
        onSuccess: (_, id) => {
            queryClient.removeQueries({ queryKey: requestKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
        },
        onError: (error) => {
            console.error('Failed to delete request:', error);
        },
    });
};