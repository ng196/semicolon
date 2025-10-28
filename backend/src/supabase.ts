import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

const supabaseUrl = config.supabaseUrl;
const supabaseKey = config.supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔗 Supabase client initialized');
console.log('   URL:', supabaseUrl);
console.log('   Key:', supabaseKey.substring(0, 20) + '...');