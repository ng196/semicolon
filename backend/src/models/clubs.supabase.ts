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

// Club Settings
/**
 * Create club settings
 */
export const createClubSettings = async (hub_id: number, is_private: boolean = false, auto_approve_members: boolean = true) => {
    const { data, error } = await supabase
        .from('club_settings')
        .insert([{
            hub_id,
            is_private,
            auto_approve_members
        }])
        .select('id')
        .single();

    if (error) {
        handleSupabaseError(error, 'createClubSettings');
    }

    return { lastInsertRowid: data!.id };
};

/**
 * Get club settings
 */
export const getClubSettings = async (hub_id: number) => {
    const { data, error } = await supabase
        .from('club_settings')
        .select('*')
        .eq('hub_id', hub_id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        handleSupabaseError(error, 'getClubSettings');
    }

    return data;
};

/**
 * Update club settings
 */
export const updateClubSettings = async (hub_id: number, data: any) => {
    const { error } = await supabase
        .from('club_settings')
        .update(data)
        .eq('hub_id', hub_id);

    if (error) {
        handleSupabaseError(error, 'updateClubSettings');
    }

    return { changes: 1 };
};

// Club Join Requests
/**
 * Create join request
 */
export const createJoinRequest = async (club_id: number, user_id: number, message: string = '') => {
    const { data, error } = await supabase
        .from('club_join_requests')
        .insert([{
            club_id,
            user_id,
            message
        }])
        .select('id')
        .single();

    if (error) {
        handleSupabaseError(error, 'createJoinRequest');
    }

    return { lastInsertRowid: data!.id };
};

/**
 * Get join request by ID with user details
 */
export const getJoinRequest = async (id: number) => {
    const { data: request, error } = await supabase
        .from('club_join_requests')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        handleSupabaseError(error, 'getJoinRequest');
    }

    // Get user details
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('name, username, avatar')
        .eq('id', request.user_id)
        .single();

    if (userError) {
        handleSupabaseError(userError, 'getJoinRequest - user');
    }

    // Flatten structure to match SQLite response
    return {
        ...request,
        user_name: user?.name || '',
        username: user?.username || '',
        user_avatar: user?.avatar || null
    };
};

/**
 * Get club join requests by status
 */
export const getClubJoinRequests = async (club_id: number, status: string = 'pending') => {
    // First, get the join requests
    const { data: requests, error: requestsError } = await supabase
        .from('club_join_requests')
        .select('*')
        .eq('club_id', club_id)
        .eq('status', status)
        .order('requested_at', { ascending: false });

    if (requestsError) {
        handleSupabaseError(requestsError, 'getClubJoinRequests');
    }

    if (!requests || requests.length === 0) {
        return [];
    }

    // Then get user details for each request
    const userIds = requests.map(r => r.user_id);
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, username, avatar')
        .in('id', userIds);

    if (usersError) {
        handleSupabaseError(usersError, 'getClubJoinRequests - users');
    }

    // Combine the data
    return requests.map(request => {
        const user = users?.find(u => u.id === request.user_id);
        return {
            ...request,
            user_name: user?.name || '',
            username: user?.username || '',
            user_avatar: user?.avatar || null
        };
    });
};

/**
 * Get user's join requests
 */
export const getUserJoinRequests = async (user_id: number) => {
    const { data, error } = await supabase
        .from('club_join_requests')
        .select(`
            *,
            hubs (
                name,
                icon
            )
        `)
        .eq('user_id', user_id)
        .order('requested_at', { ascending: false });

    if (error) {
        handleSupabaseError(error, 'getUserJoinRequests');
    }

    // Flatten structure to match SQLite response
    return data?.map(request => ({
        ...request,
        club_name: request.hubs.name,
        club_icon: request.hubs.icon
    })) || [];
};

/**
 * Update join request status
 */
export const updateJoinRequest = async (id: number, status: string, reviewed_by: number) => {
    const { error } = await supabase
        .from('club_join_requests')
        .update({
            status,
            reviewed_by,
            reviewed_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) {
        handleSupabaseError(error, 'updateJoinRequest');
    }

    return { changes: 1 };
};

// Club Posts
/**
 * Create club post
 */
export const createClubPost = async (club_id: number, author_id: number, title: string, content: string, type: string = 'general') => {
    const { data, error } = await supabase
        .from('club_posts')
        .insert([{
            club_id,
            author_id,
            title,
            content,
            type
        }])
        .select('id')
        .single();

    if (error) {
        handleSupabaseError(error, 'createClubPost');
    }

    return { lastInsertRowid: data!.id };
};

/**
 * Get club post by ID with author details
 */
export const getClubPost = async (id: number) => {
    const { data, error } = await supabase
        .from('club_posts')
        .select(`
            *,
            users!club_posts_author_id_fkey (
                name,
                username,
                avatar
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        handleSupabaseError(error, 'getClubPost');
    }

    // Flatten structure to match SQLite response
    return {
        ...data,
        author_name: data.users.name,
        author_username: data.users.username,
        author_avatar: data.users.avatar
    };
};

/**
 * Get all posts for a club
 */
export const getClubPosts = async (club_id: number) => {
    const { data, error } = await supabase
        .from('club_posts')
        .select(`
            *,
            users!club_posts_author_id_fkey (
                name,
                username,
                avatar
            )
        `)
        .eq('club_id', club_id)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        handleSupabaseError(error, 'getClubPosts');
    }

    // Flatten structure to match SQLite response
    return data?.map(post => ({
        ...post,
        author_name: post.users.name,
        author_username: post.users.username,
        author_avatar: post.users.avatar
    })) || [];
};

/**
 * Update club post
 */
export const updateClubPost = async (id: number, data: any) => {
    const updateData = {
        ...data,
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from('club_posts')
        .update(updateData)
        .eq('id', id);

    if (error) {
        handleSupabaseError(error, 'updateClubPost');
    }

    return { changes: 1 };
};

/**
 * Delete club post
 */
export const deleteClubPost = async (id: number) => {
    const { error } = await supabase
        .from('club_posts')
        .delete()
        .eq('id', id);

    if (error) {
        handleSupabaseError(error, 'deleteClubPost');
    }

    return { changes: 1 };
};

/**
 * Pin/unpin club post
 */
export const pinClubPost = async (id: number, pinned: boolean) => {
    const { error } = await supabase
        .from('club_posts')
        .update({ pinned })
        .eq('id', id);

    if (error) {
        handleSupabaseError(error, 'pinClubPost');
    }

    return { changes: 1 };
};

// Club Events
/**
 * Create club event link
 */
export const createClubEvent = async (event_id: number, club_id: number, visibility: string = 'public', target_audience: string = '') => {
    const { data, error } = await supabase
        .from('club_events')
        .insert([{
            event_id,
            club_id,
            visibility,
            target_audience
        }])
        .select('id')
        .single();

    if (error) {
        handleSupabaseError(error, 'createClubEvent');
    }

    return { lastInsertRowid: data!.id };
};

/**
 * Get club events
 */
export const getClubEvents = async (club_id: number) => {
    const { data, error } = await supabase
        .from('club_events')
        .select(`
            visibility,
            target_audience,
            events (*)
        `)
        .eq('club_id', club_id)
        .order('events(starts_at)', { ascending: true });

    if (error) {
        handleSupabaseError(error, 'getClubEvents');
    }

    // Flatten structure to match SQLite response
    return data?.map(clubEvent => ({
        ...clubEvent.events,
        visibility: clubEvent.visibility,
        target_audience: clubEvent.target_audience
    })) || [];
};

/**
 * Get event's club information
 */
export const getEventClub = async (event_id: number) => {
    const { data, error } = await supabase
        .from('club_events')
        .select(`
            visibility,
            target_audience,
            hubs (*)
        `)
        .eq('event_id', event_id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        handleSupabaseError(error, 'getEventClub');
    }

    // Flatten structure to match SQLite response
    return {
        ...data!.hubs,
        visibility: data!.visibility,
        target_audience: data!.target_audience
    };
};

/**
 * Update club event visibility
 */
export const updateClubEventVisibility = async (id: number, visibility: string) => {
    const { error } = await supabase
        .from('club_events')
        .update({ visibility })
        .eq('id', id);

    if (error) {
        handleSupabaseError(error, 'updateClubEventVisibility');
    }

    return { changes: 1 };
};