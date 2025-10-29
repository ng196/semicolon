import { useState } from 'react';
import { eventsApi } from '@/api/client';

export const useEventCreation = (onSuccess?: () => void) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createEvent = async (eventData: any) => {
        try {
            setLoading(true);
            setError(null);
            await eventsApi.create(eventData);
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create event');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { createEvent, loading, error };
};
