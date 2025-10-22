import { useState, useEffect } from 'react';
import { rsvpApi } from '@/services/api';

export const useEventRSVP = (eventId: number | null) => {
    const [userStatus, setUserStatus] = useState<string | null>(null);
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (eventId) {
            loadRSVP();
            loadAttendees();
        }
    }, [eventId]);

    const loadRSVP = async () => {
        if (!eventId) return;
        try {
            const data = await rsvpApi.getUserRSVP(eventId);
            setUserStatus(data.status);
        } catch (err) {
            console.error('Failed to load RSVP:', err);
        }
    };

    const loadAttendees = async () => {
        if (!eventId) return;
        try {
            const data = await rsvpApi.getEventRSVPs(eventId);
            setAttendees(data);
        } catch (err) {
            console.error('Failed to load attendees:', err);
        }
    };

    const updateRSVP = async (status: string) => {
        if (!eventId) return;
        try {
            setLoading(true);
            await rsvpApi.createOrUpdate(eventId, status);
            setUserStatus(status);
            // Reload attendees to get updated list
            await loadAttendees();
        } catch (err) {
            console.error('Failed to update RSVP:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { userStatus, attendees, loading, updateRSVP };
};
