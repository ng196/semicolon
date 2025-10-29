import { useState, useEffect } from 'react';
import { eventsApi } from '@/api/client';

export const useEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await eventsApi.getAll();
            setEvents(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    return { events, loading, error, refetch: loadEvents };
};
