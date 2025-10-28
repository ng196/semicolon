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
 * Create a new request
 */
export const createRequest = async (data: any) => {
    const { data: result, error } = await supabase
        .from('requests')
        .insert([{
            title: data.title,
            description: data.description,
            type: data.type,
            submitted_to: data.submitted_to,
            category: data.category,
            submitter_id: data.submitter_id,
            submitter_name: data.submitter_name,
            submitter_avatar: data.submitter_avatar,
            supporters: data.supporters || 0,
            required: data.required || 30,
            progress: data.progress || 0,
            resolution: data.resolution || null,
            response_time: data.response_time || null,
            submitted_at: data.submitted_at || 'just now',
            status: 'Pending'
        }])
        .select('id')
        .single();

    if (error) {
        handleSupabaseError(error, 'createRequest');
    }

    return { lastInsertRowid: result!.id };
};

/**
 * Get request by ID
 */
export const getRequest = async (id: number) => {
    const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        handleSupabaseError(error, 'getRequest');
    }

    return data;
};

/**
 * Get all requests
 */
export const getAllRequests = async () => {
    const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        handleSupabaseError(error, 'getAllRequests');
    }

    return data || [];
};

/**
 * Update request by ID
 */
export const updateRequest = async (id: number, data: any) => {
    const { error } = await supabase
        .from('requests')
        .update(data)
        .eq('id', id);

    if (error) {
        handleSupabaseError(error, 'updateRequest');
    }

    return { changes: 1 };
};

/**
 * Delete request by ID
 */
export const deleteRequest = async (id: number) => {
    const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', id);

    if (error) {
        handleSupabaseError(error, 'deleteRequest');
    }

    return { changes: 1 };
};