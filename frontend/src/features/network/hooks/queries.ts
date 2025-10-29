import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/client';

// Query Keys
export const networkKeys = {
    all: ['network'] as const,
    users: () => [...networkKeys.all, 'users'] as const,
    user: (id: string | number) => [...networkKeys.all, 'user', id] as const,
    connections: () => [...networkKeys.all, 'connections'] as const,
    suggestions: () => [...networkKeys.all, 'suggestions'] as const,
};

// Query Hooks
export const useNetworkUsersQuery = () => {
    return useQuery({
        queryKey: networkKeys.users(),
        queryFn: usersApi.getAll,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
    });
};

export const useUserQuery = (id: string | number) => {
    return useQuery({
        queryKey: networkKeys.user(id),
        queryFn: () => usersApi.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
};

// Mutation Hooks
export const useUpdateUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: any }) =>
            usersApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: networkKeys.user(id) });
            queryClient.invalidateQueries({ queryKey: networkKeys.users() });
        },
        onError: (error) => {
            console.error('Failed to update user:', error);
        },
    });
};