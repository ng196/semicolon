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
 * Create a new marketplace item
 */
export const createMarketplaceItem = async (data: any) => {
    const { data: result, error } = await supabase
        .from('marketplace_items')
        .insert([{
            title: data.title,
            description: data.description,
            price: data.price,
            type: data.type,
            category: data.category,
            condition: data.condition,
            image: data.image || null,
            seller_id: data.seller_id,
            seller_name: data.seller_name,
            seller_avatar: data.seller_avatar,
            seller_rating: data.seller_rating || 4.5,
            posted_at: data.posted_at || 'just now'
        }])
        .select('id')
        .single();

    if (error) {
        handleSupabaseError(error, 'createMarketplaceItem');
    }

    return { lastInsertRowid: result!.id };
};

/**
 * Get marketplace item by ID
 */
export const getMarketplaceItem = async (id: number) => {
    const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        handleSupabaseError(error, 'getMarketplaceItem');
    }

    return data;
};

/**
 * Get all marketplace items
 */
export const getAllMarketplaceItems = async () => {
    const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        handleSupabaseError(error, 'getAllMarketplaceItems');
    }

    return data || [];
};

/**
 * Update marketplace item by ID
 */
export const updateMarketplaceItem = async (id: number, data: any) => {
    const { error } = await supabase
        .from('marketplace_items')
        .update(data)
        .eq('id', id);

    if (error) {
        handleSupabaseError(error, 'updateMarketplaceItem');
    }

    return { changes: 1 };
};

/**
 * Delete marketplace item by ID
 */
export const deleteMarketplaceItem = async (id: number) => {
    const { error } = await supabase
        .from('marketplace_items')
        .delete()
        .eq('id', id);

    if (error) {
        handleSupabaseError(error, 'deleteMarketplaceItem');
    }

    return { changes: 1 };
};