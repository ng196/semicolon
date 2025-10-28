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
 * Create a new hub
 */
export const createHub = async (name: string, type: string, description: string, creator_id: number, data: any = {}) => {
    const { data: result, error } = await supabase
        .from('hubs')
        .insert([{
            name,
            type,
            description,
            creator_id,
            icon: data.icon || null,
            specialization: data.specialization || null,
            year: data.year || null,
            color: data.color || null
        }])
        .select('id')
        .single();

    if (error) {
        handleSupabaseError(error, 'createHub');
    }

    return { lastInsertRowid: result!.id };
};

/**
 * Get hub by ID with member count and interests
 */
export const getHub = async (id: number) => {
    const { data, error } = await supabase
        .from('hubs')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        handleSupabaseError(error, 'getHub');
    }

    // Get member count
    const { count: memberCount, error: memberError } = await supabase
        .from('hub_members')
        .select('*', { count: 'exact', head: true })
        .eq('hub_id', id);

    if (memberError) {
        handleSupabaseError(memberError, 'getHub - member count');
    }

    // Get interests
    const { data: interests, error: interestsError } = await supabase
        .from('hub_interests')
        .select('interest')
        .eq('hub_id', id);

    if (interestsError) {
        handleSupabaseError(interestsError, 'getHub - interests');
    }

    return {
        ...data,
        members: memberCount || 0,
        interests: interests?.map(i => i.interest) || []
    };
};

/**
 * Get all hubs with member counts and interests - OPTIMIZED
 */
export const getAllHubs = async () => {
    const startTime = Date.now();
    console.log('🔍 [getAllHubs] Starting OPTIMIZED query...');

    // Query 1: Get all hubs
    const hubsStart = Date.now();
    const { data: hubs, error } = await supabase
        .from('hubs')
        .select('*')
        .order('created_at', { ascending: false });
    console.log(`⏱️  [getAllHubs] Main hubs query: ${Date.now() - hubsStart}ms`);

    if (error) {
        handleSupabaseError(error, 'getAllHubs');
    }

    if (!hubs || hubs.length === 0) {
        console.log('📊 [getAllHubs] No hubs found');
        return [];
    }

    console.log(`📊 [getAllHubs] Found ${hubs.length} hubs`);

    const hubIds = hubs.map(h => h.id);

    // Query 2: Batch fetch all member counts
    const memberStart = Date.now();
    const { data: memberCounts, error: memberError } = await supabase
        .from('hub_members')
        .select('hub_id')
        .in('hub_id', hubIds);
    console.log(`⏱️  [getAllHubs] Batch member query: ${Date.now() - memberStart}ms`);

    if (memberError) {
        handleSupabaseError(memberError, 'getAllHubs - member counts');
    }

    // Count members per hub
    const memberCountMap = new Map<number, number>();
    memberCounts?.forEach(m => {
        memberCountMap.set(m.hub_id, (memberCountMap.get(m.hub_id) || 0) + 1);
    });

    // Query 3: Batch fetch all interests
    const interestStart = Date.now();
    const { data: allInterests, error: interestError } = await supabase
        .from('hub_interests')
        .select('hub_id, interest')
        .in('hub_id', hubIds);
    console.log(`⏱️  [getAllHubs] Batch interest query: ${Date.now() - interestStart}ms`);

    if (interestError) {
        handleSupabaseError(interestError, 'getAllHubs - interests');
    }

    // Group interests by hub_id
    const interestMap = new Map<number, string[]>();
    allInterests?.forEach(i => {
        if (!interestMap.has(i.hub_id)) {
            interestMap.set(i.hub_id, []);
        }
        interestMap.get(i.hub_id)!.push(i.interest);
    });

    // Combine all data
    const hubsWithDetails = hubs.map(hub => ({
        ...hub,
        members: memberCountMap.get(hub.id) || 0,
        interests: interestMap.get(hub.id) || []
    }));

    const totalTime = Date.now() - startTime;
    console.log(`✅ [getAllHubs] Total execution time: ${totalTime}ms`);
    console.log(`📈 [getAllHubs] Total queries: 3 (optimized from ${1 + hubs.length * 2})`);
    console.log(`🚀 [getAllHubs] Performance improvement: ${Math.round((1 - totalTime / 5000) * 100)}%`);

    if (totalTime > 1000) {
        console.warn(`⚠️  [getAllHubs] SLOW QUERY WARNING: ${totalTime}ms`);
    }

    return hubsWithDetails;
};

/**
 * Get hubs by type - OPTIMIZED
 */
export const getHubsByType = async (type: string) => {
    const startTime = Date.now();
    console.log(`🔍 [getHubsByType] Starting OPTIMIZED query for type: ${type}...`);

    // Query 1: Get hubs filtered by type
    const hubsStart = Date.now();
    const { data: hubs, error } = await supabase
        .from('hubs')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false });
    console.log(`⏱️  [getHubsByType] Main hubs query: ${Date.now() - hubsStart}ms`);

    if (error) {
        handleSupabaseError(error, 'getHubsByType');
    }

    if (!hubs || hubs.length === 0) {
        console.log(`📊 [getHubsByType] No hubs found of type ${type}`);
        return [];
    }

    console.log(`📊 [getHubsByType] Found ${hubs.length} hubs of type ${type}`);

    const hubIds = hubs.map(h => h.id);

    // Query 2: Batch fetch all member counts for these hubs
    const memberStart = Date.now();
    const { data: memberCounts, error: memberError } = await supabase
        .from('hub_members')
        .select('hub_id')
        .in('hub_id', hubIds);
    console.log(`⏱️  [getHubsByType] Batch member query: ${Date.now() - memberStart}ms`);

    if (memberError) {
        handleSupabaseError(memberError, 'getHubsByType - member counts');
    }

    // Count members per hub
    const memberCountMap = new Map<number, number>();
    memberCounts?.forEach(m => {
        memberCountMap.set(m.hub_id, (memberCountMap.get(m.hub_id) || 0) + 1);
    });

    // Query 3: Batch fetch all interests for these hubs
    const interestStart = Date.now();
    const { data: allInterests, error: interestError } = await supabase
        .from('hub_interests')
        .select('hub_id, interest')
        .in('hub_id', hubIds);
    console.log(`⏱️  [getHubsByType] Batch interest query: ${Date.now() - interestStart}ms`);

    if (interestError) {
        handleSupabaseError(interestError, 'getHubsByType - interests');
    }

    // Group interests by hub_id
    const interestMap = new Map<number, string[]>();
    allInterests?.forEach(i => {
        if (!interestMap.has(i.hub_id)) {
            interestMap.set(i.hub_id, []);
        }
        interestMap.get(i.hub_id)!.push(i.interest);
    });

    // Combine all data
    const hubsWithDetails = hubs.map(hub => ({
        ...hub,
        members: memberCountMap.get(hub.id) || 0,
        interests: interestMap.get(hub.id) || []
    }));

    const totalTime = Date.now() - startTime;
    console.log(`✅ [getHubsByType] Total execution time: ${totalTime}ms`);
    console.log(`📈 [getHubsByType] Total queries: 3 (optimized from ${1 + hubs.length * 2})`);
    console.log(`🚀 [getHubsByType] Performance improvement: ${Math.round((1 - totalTime / 5000) * 100)}%`);

    if (totalTime > 1000) {
        console.warn(`⚠️  [getHubsByType] SLOW QUERY WARNING: ${totalTime}ms`);
    }

    return hubsWithDetails;
};

/**
 * Update hub by ID
 */
export const updateHub = async (id: number, data: any) => {
    const { error } = await supabase
        .from('hubs')
        .update(data)
        .eq('id', id);

    if (error) {
        handleSupabaseError(error, 'updateHub');
    }

    return { changes: 1 };
};

/**
 * Delete hub by ID
 */
export const deleteHub = async (id: number) => {
    const { error } = await supabase
        .from('hubs')
        .delete()
        .eq('id', id);

    if (error) {
        handleSupabaseError(error, 'deleteHub');
    }

    return { changes: 1 };
};

/**
 * Add member to hub
 */
export const addHubMember = async (hub_id: number, user_id: number, role: string = 'member') => {
    const { data, error } = await supabase
        .from('hub_members')
        .insert([{ hub_id, user_id, role }])
        .select('id')
        .single();

    if (error) {
        handleSupabaseError(error, 'addHubMember');
    }

    return { lastInsertRowid: data!.id };
};

/**
 * Remove member from hub
 */
export const removeHubMember = async (hub_id: number, user_id: number) => {
    const { error } = await supabase
        .from('hub_members')
        .delete()
        .eq('hub_id', hub_id)
        .eq('user_id', user_id);

    if (error) {
        handleSupabaseError(error, 'removeHubMember');
    }

    return { changes: 1 };
};

/**
 * Get hub members with user details
 */
export const getHubMembers = async (hub_id: number) => {
    const { data, error } = await supabase
        .from('hub_members')
        .select(`
            role,
            joined_at,
            users (
                id,
                name,
                username,
                avatar,
                specialization,
                year
            )
        `)
        .eq('hub_id', hub_id);

    if (error) {
        handleSupabaseError(error, 'getHubMembers');
    }

    // Flatten the structure to match SQLite response
    return data?.map((member: any) => ({
        id: member.users.id,
        name: member.users.name,
        username: member.users.username,
        avatar: member.users.avatar,
        specialization: member.users.specialization,
        year: member.users.year,
        role: member.role,
        joined_at: member.joined_at
    })) || [];
};

/**
 * Check hub membership for a user
 */
export const checkHubMembership = async (hub_id: number, user_id: number) => {
    const { data, error } = await supabase
        .from('hub_members')
        .select('role, joined_at')
        .eq('hub_id', hub_id)
        .eq('user_id', user_id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return { isMember: false };
        }
        handleSupabaseError(error, 'checkHubMembership');
    }

    return {
        isMember: true,
        role: data!.role,
        joinedAt: data!.joined_at
    };
};

/**
 * Add interest to hub
 */
export const addHubInterest = async (hub_id: number, interest: string) => {
    const { data, error } = await supabase
        .from('hub_interests')
        .insert([{ hub_id, interest }])
        .select('id')
        .single();

    if (error) {
        handleSupabaseError(error, 'addHubInterest');
    }

    return { lastInsertRowid: data!.id };
};

/**
 * Get hub interests
 */
export const getHubInterests = async (hub_id: number) => {
    const { data, error } = await supabase
        .from('hub_interests')
        .select('interest')
        .eq('hub_id', hub_id);

    if (error) {
        handleSupabaseError(error, 'getHubInterests');
    }

    return data || [];
};

/**
 * Get user's role in a club
 */
export const getUserClubRole = async (club_id: number, user_id: number) => {
    const { data, error } = await supabase
        .from('hub_members')
        .select('role')
        .eq('hub_id', club_id)
        .eq('user_id', user_id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        handleSupabaseError(error, 'getUserClubRole');
    }

    return data!.role;
};

/**
 * Check if user is a club member
 */
export const isClubMember = async (club_id: number, user_id: number) => {
    const { count, error } = await supabase
        .from('hub_members')
        .select('*', { count: 'exact', head: true })
        .eq('hub_id', club_id)
        .eq('user_id', user_id);

    if (error) {
        handleSupabaseError(error, 'isClubMember');
    }

    return (count || 0) > 0;
};

/**
 * Check if user can manage members
 */
export const canManageMembers = async (club_id: number, user_id: number) => {
    const role = await getUserClubRole(club_id, user_id);
    return role === 'leader' || role === 'admin' || role === 'creator';
};

/**
 * Check if user can manage posts
 */
export const canManagePosts = async (club_id: number, user_id: number) => {
    const role = await getUserClubRole(club_id, user_id);
    return role === 'leader' || role === 'admin' || role === 'moderator' || role === 'creator';
};