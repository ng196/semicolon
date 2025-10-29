import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsService, rsvpService } from '@/api/services';
import type { CreateEventData, UpdateEventData } from '@/api/services';

// Query Keys - Centralized for consistency
export const eventKeys = {
    all: ['events'] as const,
    lists: () => [...eventKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...eventKeys.lists(), { filters }] as const,
    details: () => [...eventKeys.all, 'detail'] as const,
    detail: (id: string | number) => [...eventKeys.details(), id] as const,
    dashboard: () => [...eventKeys.all, 'dashboard'] as const,
    rsvps: (eventId: string | number) => [...eventKeys.all, 'rsvps', eventId] as const,
    userRsvp: (eventId: string | number) => [...eventKeys.all, 'user-rsvp', eventId] as const,
};

// Standard Query Hooks
export const useEventsQuery = () => {
    return useQuery({
        queryKey: eventKeys.lists(),
        queryFn: eventsService.getAll,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
    });
};

export const useEventQuery = (id: string | number) => {
    return useQuery({
        queryKey: eventKeys.detail(id),
        queryFn: () => eventsService.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
};

export const useDashboardEventsQuery = () => {
    return useQuery({
        queryKey: eventKeys.dashboard(),
        queryFn: eventsService.getDashboard,
        staleTime: 2 * 60 * 1000, // 2 minutes for dashboard
    });
};

export const useEventRSVPsQuery = (eventId: string | number) => {
    return useQuery({
        queryKey: eventKeys.rsvps(eventId),
        queryFn: () => rsvpService.getEventRSVPs(Number(eventId)),
        enabled: !!eventId,
        staleTime: 30 * 1000, // 30 seconds for RSVP data
    });
};

export const useUserRSVPQuery = (eventId: string | number) => {
    return useQuery({
        queryKey: eventKeys.userRsvp(eventId),
        queryFn: () => rsvpService.getUserRSVP(Number(eventId)),
        enabled: !!eventId,
        staleTime: 30 * 1000,
    });
};

// Mutation Hooks
export const useCreateEventMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: eventsService.create,
        onSuccess: () => {
            // Invalidate and refetch events list
            queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
            queryClient.invalidateQueries({ queryKey: eventKeys.dashboard() });
        },
        onError: (error) => {
            console.error('Failed to create event:', error);
        },
    });
};

export const useUpdateEventMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: UpdateEventData }) =>
            eventsService.update(id, data),
        onSuccess: (_, { id }) => {
            // Invalidate specific event and lists
            queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
            queryClient.invalidateQueries({ queryKey: eventKeys.dashboard() });
        },
        onError: (error) => {
            console.error('Failed to update event:', error);
        },
    });
};

export const useDeleteEventMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: eventsService.delete,
        onSuccess: (_, id) => {
            // Remove from cache and invalidate lists
            queryClient.removeQueries({ queryKey: eventKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
            queryClient.invalidateQueries({ queryKey: eventKeys.dashboard() });
        },
        onError: (error) => {
            console.error('Failed to delete event:', error);
        },
    });
};

export const useRSVPMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, status }: { eventId: number; status: 'going' | 'maybe' | 'not_going' }) =>
            rsvpService.createOrUpdate(eventId, status),
        onSuccess: (_, { eventId }) => {
            // Invalidate RSVP related queries
            queryClient.invalidateQueries({ queryKey: eventKeys.rsvps(eventId) });
            queryClient.invalidateQueries({ queryKey: eventKeys.userRsvp(eventId) });
            queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
            queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
            queryClient.invalidateQueries({ queryKey: eventKeys.dashboard() });
        },
        onError: (error) => {
            console.error('Failed to update RSVP:', error);
        },
    });
};

// Convenience hook that combines multiple queries
export const useEventWithRSVP = (eventId: string | number) => {
    const eventQuery = useEventQuery(eventId);
    const rsvpsQuery = useEventRSVPsQuery(eventId);
    const userRsvpQuery = useUserRSVPQuery(eventId);

    return {
        event: eventQuery.data,
        rsvps: rsvpsQuery.data,
        userRsvp: userRsvpQuery.data,
        isLoading: eventQuery.isLoading || rsvpsQuery.isLoading || userRsvpQuery.isLoading,
        error: eventQuery.error || rsvpsQuery.error || userRsvpQuery.error,
        refetch: () => {
            eventQuery.refetch();
            rsvpsQuery.refetch();
            userRsvpQuery.refetch();
        },
    };
};