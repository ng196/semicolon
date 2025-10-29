import { useState, useEffect } from 'react';
import { eventsApi } from '@/api/client';

export const useClubEvents = (clubId: number | null) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (clubId) loadEvents();
    }, [clubId]);

    const loadEvents = async () => {
        if (!clubId) return;
        try {
            setLoading(true);
            const data = await eventsApi.getAll();
            const clubEvents = data.filter((e: any) => e.club_id === clubId);
            setEvents(clubEvents);
        } catch (err) {
            console.error('Failed to load club events:', err);
        } finally {
            setLoading(false);
        }
    };

    return { events, loading };
};
