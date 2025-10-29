import { enhancedApiClient } from '../enhancedClient';

// Types
export interface Event {
    id: number;
    name: string;
    description: string;
    date: string;
    time: string;
    location: string;
    capacity: number;
    attending: number;
    club_id?: number;
    club_name?: string;
    category?: string;
    visibility?: 'public' | 'private' | 'members_only';
    created_at: string;
    updated_at: string;
}

export interface CreateEventData {
    name: string;
    description: string;
    date: string;
    time: string;
    location: string;
    capacity: number;
    club_id?: number;
    category?: string;
    visibility?: 'public' | 'private' | 'members_only';
}

export interface UpdateEventData extends Partial<CreateEventData> { }

export interface RSVP {
    id: number;
    event_id: number;
    user_id: number;
    status: 'going' | 'maybe' | 'not_going';
    created_at: string;
    updated_at: string;
}

export interface EventWithRSVP extends Event {
    user_rsvp?: RSVP;
    rsvp_counts: {
        going: number;
        maybe: number;
        not_going: number;
    };
}

// Events API Service
export const eventsService = {
    // Get all events
    getAll: (): Promise<Event[]> => {
        return enhancedApiClient.get<Event[]>('/events');
    },

    // Get event by ID
    getById: (id: string | number): Promise<EventWithRSVP> => {
        return enhancedApiClient.get<EventWithRSVP>(`/events/${id}`);
    },

    // Create new event
    create: (data: CreateEventData): Promise<Event> => {
        return enhancedApiClient.post<Event>('/events', data);
    },

    // Update event
    update: (id: string | number, data: UpdateEventData): Promise<Event> => {
        return enhancedApiClient.put<Event>(`/events/${id}`, data);
    },

    // Delete event
    delete: (id: string | number): Promise<void> => {
        return enhancedApiClient.delete<void>(`/events/${id}`);
    },

    // Get dashboard events (upcoming, attending, etc.)
    getDashboard: (): Promise<{
        upcoming: Event[];
        attending: Event[];
        created: Event[];
    }> => {
        return enhancedApiClient.get('/events/dashboard');
    },

    // Get events by club
    getByClub: (clubId: string | number): Promise<Event[]> => {
        return enhancedApiClient.get<Event[]>(`/clubs/${clubId}/events`);
    },
};

// RSVP API Service
export const rsvpService = {
    // Create or update RSVP
    createOrUpdate: (eventId: number, status: 'going' | 'maybe' | 'not_going'): Promise<RSVP> => {
        return enhancedApiClient.post<RSVP>('/rsvps', { event_id: eventId, status });
    },

    // Get event RSVPs
    getEventRSVPs: (eventId: number): Promise<{
        rsvps: RSVP[];
        counts: { going: number; maybe: number; not_going: number };
    }> => {
        return enhancedApiClient.get(`/rsvps/event/${eventId}`);
    },

    // Get user's RSVP for event
    getUserRSVP: (eventId: number): Promise<RSVP | null> => {
        return enhancedApiClient.get(`/rsvps/event/${eventId}/user`);
    },

    // Delete RSVP
    delete: (eventId: number): Promise<void> => {
        return enhancedApiClient.delete(`/rsvps/event/${eventId}`);
    },
};