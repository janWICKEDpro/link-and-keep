
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client with proper configuration for auth
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    // Use pkce flow which doesn't enforce email verification
    flowType: 'pkce'
  },
  global: {
    fetch: (...args) => {
      // Add retry logic for failed requests
      return fetch(...args).catch(err => {
        console.error('Fetch error:', err);
        throw err;
      });
    }
  }
});

export default supabase;
