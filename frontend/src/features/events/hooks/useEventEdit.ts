import { useState } from 'react';
import { eventsApi } from '@/api/client';

export const useEventEdit = (onSuccess?: () => void) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateEvent = async (eventId: number, eventData: any) => {
        try {
            setLoading(true);
            setError(null);
            await eventsApi.update(eventId, eventData);
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update event');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { updateEvent, loading, error };
};