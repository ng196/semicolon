import { useState, useEffect } from 'react';
import { eventsApi } from '@/api/client';

export const useEventDetails = (eventId: number | null) => {
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (eventId) loadEvent();
    }, [eventId]);

    const loadEvent = async () => {
        if (!eventId) return;
        try {
            setLoading(true);
            const data = await eventsApi.getById(eventId);
            setEvent(data);
        } catch (err) {
            console.error('Failed to load event:', err);
        } finally {
            setLoading(false);
        }
    };

    return { event, loading };
};
