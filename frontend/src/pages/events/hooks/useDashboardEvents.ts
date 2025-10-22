import { useState, useEffect } from 'react';
import { eventsApi } from '@/services/api';

export const useDashboardEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const data = await eventsApi.getDashboard();
            setEvents(data);
        } catch (err) {
            console.error('Failed to load dashboard events:', err);
        } finally {
            setLoading(false);
        }
    };

    return { events, loading };
};
