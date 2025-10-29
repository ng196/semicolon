import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hubsApi } from '@/api/client';

// Query Keys for Hubs (Projects)
export const hubKeys = {
    all: ['hubs'] as const,
    lists: () => [...hubKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...hubKeys.lists(), { filters }] as const,
    details: () => [...hubKeys.all, 'detail'] as const,
    detail: (id: string | number) => [...hubKeys.details(), id] as const,
    members: (id: string | number) => [...hubKeys.all, 'members', id] as const,
    membership: (id: string | number, userId: number) => [...hubKeys.all, 'membership', id, userId] as const,
};

// Hub Query Hooks (for basic hub/project operations)
export const useHubsQuery = () => {
    return useQuery({
        queryKey: hubKeys.lists(),
        queryFn: hubsApi.getAll,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
    });
};

export const useHubQuery = (id: string | number) => {
    return useQuery({
        queryKey: hubKeys.detail(id),
        queryFn: () => hubsApi.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
};

export const useHubMembersQuery = (id: string | number) => {
    return useQuery({
        queryKey: hubKeys.members(id),
        queryFn: () => hubsApi.getMembers(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes for member data
    });
};

export const useHubMembershipQuery = (id: string | number, userId: number) => {
    return useQuery({
        queryKey: hubKeys.membership(id, userId),
        queryFn: () => hubsApi.checkMembership(id, userId),
        enabled: !!id && !!userId,
        staleTime: 30 * 1000, // 30 seconds for membership status
    });
};

// Project-specific queries are now in projects/hooks/

// Hub Mutation Hooks (basic CRUD operations)
export const useCreateHubMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: hubsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hubKeys.lists() });
        },
        onError: (error) => {
            console.error('Failed to create hub:', error);
        },
    });
};

export const useUpdateHubMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: any }) =>
            hubsApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: hubKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: hubKeys.lists() });
        },
        onError: (error) => {
            console.error('Failed to update hub:', error);
        },
    });
};

export const useDeleteHubMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: hubsApi.delete,
        onSuccess: (_, id) => {
            queryClient.removeQueries({ queryKey: hubKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: hubKeys.lists() });
        },
        onError: (error) => {
            console.error('Failed to delete hub:', error);
        },
    });
};

// Project-specific mutations are now in projects/hooks/