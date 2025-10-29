import { useState, useEffect } from 'react';
import eventsData from '@/data/events.json';

export const useDashboardEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            // Use static events data for now
            const data = eventsData;
            // Filter for upcoming events and show first 3 for dashboard
            const upcomingEvents = data.slice(0, 3);
            setEvents(upcomingEvents);
        } catch (err) {
            console.error('Failed to load dashboard events:', err);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    return { events, loading };
};
