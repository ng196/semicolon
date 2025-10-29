import { useQueryClient } from '@tanstack/react-query';

/**
 * Shared query utilities and common patterns
 */

// Common query options
export const queryOptions = {
    // Standard stale times
    staleTime: {
        short: 30 * 1000,      // 30 seconds - for frequently changing data
        medium: 2 * 60 * 1000,  // 2 minutes - for moderately changing data
        long: 5 * 60 * 1000,    // 5 minutes - for stable data
        veryLong: 15 * 60 * 1000, // 15 minutes - for very stable data
    },

    // Standard retry configurations
    retry: {
        none: 0,
        light: 1,
        standard: 3,
        aggressive: 5,
    },

    // Standard refetch intervals
    refetchInterval: {
        realtime: 5 * 1000,     // 5 seconds - for real-time data
        frequent: 30 * 1000,    // 30 seconds - for frequently updated data
        moderate: 2 * 60 * 1000, // 2 minutes - for moderately updated data
        slow: 5 * 60 * 1000,    // 5 minutes - for slowly updated data
    },
};

/**
 * Hook for common query client operations
 */
export const useQueryUtils = () => {
    const queryClient = useQueryClient();

    const invalidateQueries = (queryKey: unknown[]) => {
        return queryClient.invalidateQueries({ queryKey });
    };

    const removeQueries = (queryKey: unknown[]) => {
        return queryClient.removeQueries({ queryKey });
    };

    const setQueryData = (queryKey: unknown[], data: unknown) => {
        return queryClient.setQueryData(queryKey, data);
    };

    const getQueryData = (queryKey: unknown[]) => {
        return queryClient.getQueryData(queryKey);
    };

    const prefetchQuery = (queryKey: unknown[], queryFn: () => Promise<unknown>) => {
        return queryClient.prefetchQuery({ queryKey, queryFn });
    };

    const resetQueries = (queryKey?: unknown[]) => {
        return queryClient.resetQueries(queryKey ? { queryKey } : undefined);
    };

    return {
        invalidateQueries,
        removeQueries,
        setQueryData,
        getQueryData,
        prefetchQuery,
        resetQueries,
        queryClient,
    };
};

/**
 * Common error handler for mutations
 */
export const createMutationErrorHandler = (context: string) => {
    return (error: Error) => {
        console.error(`${context}:`, error);
        // You can add toast notifications here
        // toast.error(error.message || `Failed to ${context.toLowerCase()}`);
    };
};

/**
 * Common success handler for mutations
 */
export const createMutationSuccessHandler = (
    queryClient: ReturnType<typeof useQueryClient>,
    invalidateKeys: unknown[][],
    removeKeys?: unknown[][]
) => {
    return () => {
        // Invalidate specified queries
        invalidateKeys.forEach(key => {
            queryClient.invalidateQueries({ queryKey: key });
        });

        // Remove specified queries
        removeKeys?.forEach(key => {
            queryClient.removeQueries({ queryKey: key });
        });
    };
};

/**
 * Generic query key factory
 */
export const createQueryKeyFactory = (feature: string) => {
    return {
        all: [feature] as const,
        lists: () => [feature, 'list'] as const,
        list: (filters: Record<string, unknown>) => [feature, 'list', { filters }] as const,
        details: () => [feature, 'detail'] as const,
        detail: (id: string | number) => [feature, 'detail', id] as const,
    };
};

/**
 * Hook for optimistic updates
 */
export const useOptimisticUpdate = () => {
    const queryClient = useQueryClient();

    const updateOptimistically = <T>(
        queryKey: unknown[],
        updater: (old: T | undefined) => T
    ) => {
        const previousData = queryClient.getQueryData<T>(queryKey);
        queryClient.setQueryData(queryKey, updater);
        return previousData;
    };

    const rollbackOptimisticUpdate = <T>(queryKey: unknown[], previousData: T) => {
        queryClient.setQueryData(queryKey, previousData);
    };

    return {
        updateOptimistically,
        rollbackOptimisticUpdate,
    };
};