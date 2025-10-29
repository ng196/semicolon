import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/api/client';

export const useDashboardEvents = () => {
    const { data: events = [], isLoading: loading, error } = useQuery({
        queryKey: ['events', 'dashboard'],
        queryFn: eventsApi.getDashboard,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
    });

    if (error) {
        console.error('Failed to load dashboard events:', error);
    }

    return {
        events: events?.data || [],
        loading
    };
};
