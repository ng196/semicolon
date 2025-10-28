import { supabase } from '../supabase.js';

/**
 * Enhanced error handler for Supabase operations
 */
const handleSupabaseError = (error: any, operation: string): never => {
    console.error(`Supabase ${operation} error:`, error);

    const enhancedError: any = new Error(error.message || 'Database operation failed');
    enhancedError.code = error.code;
    enhancedError.details = error.details;
    enhancedError.hint = error.hint;
    enhancedError.operation = operation;

    throw enhancedError;
};

/**
 * Create a new event
 * Converts date/time to PostgreSQL TIMESTAMPTZ format
 */
export const createEvent = async (data: any) => {
    // Convert date and time to PostgreSQL TIMESTAMPTZ
    const starts_at = data.date && data.time ?
        `${data.date}T${data.time}:00Z` :
        new Date().toISOString();

    const { data: result, error } = await supabase
        .from('events')
        .insert([{
            name: data.name,
            category: data.category,
            description: data.description,
            starts_at,
            location: data.location,
            organizer: data.organizer,
            specialization: data.specialization || null,
            capacity: data.capacity || 100,
            color: data.color || null
        }])
        .select('id')
        .single();

    if (error) {
        handleSupabaseError(error, 'createEvent');
    }

    return { lastInsertRowid: result!.id };
};

/**
 * Get event by ID with club information
 */
export const getEvent = async (id: number, userId?: number) => {
    const { data, error } = await supabase
        .from('events')
        .select(`
            *,
            club_events (
                club_id,
                visibility,
                target_audience,
                hubs (
                    name,
                    icon,
                    color
                )
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        handleSupabaseError(error, 'getEvent');
    }

    // Check if user can edit (if userId provided)
    let can_edit = 0;
    if (userId && data.club_events?.length > 0) {
        const { data: memberData } = await supabase
            .from('hub_members')
            .select('role')
            .eq('hub_id', data.club_events[0].club_id)
            .eq('user_id', userId)
            .single();

        if (memberData && ['leader', 'admin', 'creator'].includes(memberData.role)) {
            can_edit = 1;
        }
    }

    // Format response to match SQLite structure
    const clubEvent = data.club_events?.[0];
    return {
        ...data,
        club_id: clubEvent?.club_id || null,
        visibility: clubEvent?.visibility || null,
        target_audience: clubEvent?.target_audience || null,
        club_name: clubEvent?.hubs?.name || null,
        club_icon: clubEvent?.hubs?.icon || null,
        club_color: clubEvent?.hubs?.color || null,
        can_edit
    };
};

/**
 * Get all events with visibility filtering
 */
export const getAllEvents = async (userId?: number) => {
    let query = supabase
        .from('events')
        .select(`
            *,
            club_events (
                club_id,
                visibility,
                target_audience,
                hubs (
                    name,
                    icon,
                    color
                )
            )
        `)
        .order('starts_at', { ascending: true });

    const { data, error } = await query;

    if (error) {
        handleSupabaseError(error, 'getAllEvents');
    }

    // Filter events based on visibility and user membership
    const filteredEvents = [];
    for (const event of data || []) {
        const clubEvent = event.club_events?.[0];

        if (!clubEvent || clubEvent.visibility === 'public' || !clubEvent.visibility) {
            filteredEvents.push(event);
            continue;
        }

        if (userId && clubEvent.club_id) {
            const { data: memberData } = await supabase
                .from('hub_members')
                .select('role')
                .eq('hub_id', clubEvent.club_id)
                .eq('user_id', userId)
                .single();

            if (memberData) {
                if (clubEvent.visibility === 'members_only' ||
                    (clubEvent.visibility === 'private' && ['leader', 'admin', 'creator'].includes(memberData.role))) {
                    filteredEvents.push(event);
                }
            }
        }
    }

    // Format response to match SQLite structure
    return filteredEvents.map(event => {
        const clubEvent = event.club_events?.[0];
        return {
            ...event,
            club_id: clubEvent?.club_id || null,
            visibility: clubEvent?.visibility || null,
            target_audience: clubEvent?.target_audience || null,
            club_name: clubEvent?.hubs?.name || null,
            club_icon: clubEvent?.hubs?.icon || null,
            club_color: clubEvent?.hubs?.color || null,
            can_edit: 0 // Will be calculated per user if needed
        };
    });
};

/**
 * Get dashboard events (upcoming, limited to 3)
 */
export const getDashboardEvents = async (userId?: number) => {
    const { data, error } = await supabase
        .from('events')
        .select(`
            *,
            club_events (
                club_id,
                visibility,
                hubs (
                    name,
                    icon,
                    color
                )
            )
        `)
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
        .limit(10); // Get more to filter, then limit to 3

    if (error) {
        handleSupabaseError(error, 'getDashboardEvents');
    }

    // Filter and sort by membership
    const eventsWithMembership = [];
    for (const event of data || []) {
        const clubEvent = event.club_events?.[0];
        let is_member = 0;

        if (userId && clubEvent?.club_id) {
            const { data: memberData } = await supabase
                .from('hub_members')
                .select('user_id')
                .eq('hub_id', clubEvent.club_id)
                .eq('user_id', userId)
                .single();

            is_member = memberData ? 1 : 0;
        }

        // Only include public events or events where user is a member
        if (!clubEvent || clubEvent.visibility === 'public' || is_member) {
            eventsWithMembership.push({
                ...event,
                club_id: clubEvent?.club_id || null,
                visibility: clubEvent?.visibility || null,
                club_name: clubEvent?.hubs?.name || null,
                club_icon: clubEvent?.hubs?.icon || null,
                club_color: clubEvent?.hubs?.color || null,
                is_member
            });
        }
    }

    // Sort by membership (members first) and limit to 3
    return eventsWithMembership
        .sort((a, b) => b.is_member - a.is_member)
        .slice(0, 3);
};

/**
 * Update event by ID
 */
export const updateEvent = async (id: number, data: any) => {
    // Convert date/time if provided
    const updateData = { ...data };
    if (data.date && data.time) {
        updateData.starts_at = `${data.date}T${data.time}:00Z`;
        delete updateData.date;
        delete updateData.time;
    }

    const { error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id);

    if (error) {
        handleSupabaseError(error, 'updateEvent');
    }

    return { changes: 1 };
};

/**
 * Delete event by ID
 */
export const deleteEvent = async (id: number) => {
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

    if (error) {
        handleSupabaseError(error, 'deleteEvent');
    }

    return { changes: 1 };
};

/**
 * Link event to club
 */
export const linkEventToClub = async (event_id: number, club_id: number, visibility: string = 'public', target_audience?: string) => {
    const { data, error } = await supabase
        .from('club_events')
        .insert([{
            event_id,
            club_id,
            visibility,
            target_audience: target_audience || null
        }])
        .select('id')
        .single();

    if (error) {
        handleSupabaseError(error, 'linkEventToClub');
    }

    return { lastInsertRowid: data!.id };
};

/**
 * Update club event settings
 */
export const updateClubEventSettings = async (event_id: number, data: any) => {
    const { error } = await supabase
        .from('club_events')
        .update(data)
        .eq('event_id', event_id);

    if (error) {
        handleSupabaseError(error, 'updateClubEventSettings');
    }

    return { changes: 1 };
};

/**
 * Get club event information
 */
export const getClubEventInfo = async (event_id: number) => {
    const { data, error } = await supabase
        .from('club_events')
        .select('*')
        .eq('event_id', event_id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        handleSupabaseError(error, 'getClubEventInfo');
    }

    return data;
};