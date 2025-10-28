import { supabase } from '../supabase.js';

/**
 * Enhanced error handler for Supabase operations
 * Provides detailed error information while maintaining compatibility
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
 * Create a new user
 * Returns object with lastInsertRowid for SQLite compatibility
 */
export const createUser = async (email: string, password_hash: string, username: string, name: string) => {
    const { data, error } = await supabase
        .from('users')
        .insert([{ email, password_hash, username, name }])
        .select('id')
        .single();

    if (error) {
        handleSupabaseError(error, 'createUser');
    }

    // Return SQLite-compatible format
    return { lastInsertRowid: data!.id };
};

/**
 * Parse interests field from JSON string to array
 */
const parseUserInterests = (user: any) => {
    if (!user) return user;

    // Parse interests if it's a string
    if (user.interests && typeof user.interests === 'string') {
        try {
            user.interests = JSON.parse(user.interests);
        } catch (e) {
            user.interests = [];
        }
    }

    // Ensure interests is an array
    if (!Array.isArray(user.interests)) {
        user.interests = [];
    }

    return user;
};

/**
 * Get user by ID
 */
export const getUser = async (id: number) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        // Return null for not found (SQLite behavior)
        if (error.code === 'PGRST116') {
            return null;
        }
        handleSupabaseError(error, 'getUser');
    }

    return parseUserInterests(data);
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error) {
        // Return null for not found (SQLite behavior)
        if (error.code === 'PGRST116') {
            return null;
        }
        handleSupabaseError(error, 'getUserByEmail');
    }

    return parseUserInterests(data);
};

/**
 * Get all users
 * Returns specific fields matching SQLite query
 */
export const getAllUsers = async () => {
    const { data, error } = await supabase
        .from('users')
        .select('id, email, username, name, avatar, specialization, year, interests, online_status, last_seen, attendance_rate, created_at');

    if (error) {
        handleSupabaseError(error, 'getAllUsers');
    }

    // Parse interests for all users
    return (data || []).map(parseUserInterests);
};

/**
 * Update user by ID
 * Accepts dynamic data object for flexible updates
 */
export const updateUser = async (id: number, data: any) => {
    const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', id);

    if (error) {
        handleSupabaseError(error, 'updateUser');
    }

    // Return SQLite-compatible format
    return { changes: 1 };
};

/**
 * Delete user by ID
 */
export const deleteUser = async (id: number) => {
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

    if (error) {
        handleSupabaseError(error, 'deleteUser');
    }

    // Return SQLite-compatible format
    return { changes: 1 };
};
