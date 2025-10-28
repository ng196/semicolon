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
 * Create or update RSVP for an event
 */
export const createOrUpdateRSVP = async (event_id: number, user_id: number, status: string) => {
    // Check if RSVP already exists
    const { data: existing, error: checkError } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_id', event_id)
        .eq('user_id', user_id)
        .single();

    if (checkError && checkError.code !== 'PGRST116') {
        handleSupabaseError(checkError, 'createOrUpdateRSVP - check existing');
    }

    if (existing) {
        // Update existing RSVP
        const { error } = await supabase
            .from('event_rsvps')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('event_id', event_id)
            .eq('user_id', user_id);

        if (error) {
            handleSupabaseError(error, 'createOrUpdateRSVP - update');
        }

        return { changes: 1 };
    } else {
        // Create new RSVP
        const { data, error } = await supabase
            .from('event_rsvps')
            .insert([{ event_id, user_id, status }])
            .select('id')
            .single();

        if (error) {
            handleSupabaseError(error, 'createOrUpdateRSVP - insert');
        }

        return { lastInsertRowid: data!.id };
    }
};

/**
 * Get all RSVPs for an event with user details
 */
export const getEventRSVPs = async (event_id: number) => {
    const { data, error } = await supabase
        .from('event_rsvps')
        .select(`
            *,
            users (
                name,
                avatar
            )
        `)
        .eq('event_id', event_id)
        .order('created_at', { ascending: false });

    if (error) {
        handleSupabaseError(error, 'getEventRSVPs');
    }

    // Flatten the structure to match SQLite response
    return data?.map(rsvp => ({
        ...rsvp,
        name: rsvp.users.name,
        avatar: rsvp.users.avatar
    })) || [];
};

/**
 * Get user's RSVP status for an event
 */
export const getUserRSVP = async (event_id: number, user_id: number) => {
    const { data, error } = await supabase
        .from('event_rsvps')
        .select('status')
        .eq('event_id', event_id)
        .eq('user_id', user_id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        handleSupabaseError(error, 'getUserRSVP');
    }

    return data;
};

/**
 * Get count of users going to an event
 */
export const getEventGoingCount = async (event_id: number) => {
    const { count, error } = await supabase
        .from('event_rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event_id)
        .eq('status', 'going');

    if (error) {
        handleSupabaseError(error, 'getEventGoingCount');
    }

    return { count: count || 0 };
};

/**
 * Update event attending count
 */
export const updateEventAttendingCount = async (event_id: number, count: number) => {
    const { error } = await supabase
        .from('events')
        .update({ attending: count })
        .eq('id', event_id);

    if (error) {
        handleSupabaseError(error, 'updateEventAttendingCount');
    }

    return { changes: 1 };
};