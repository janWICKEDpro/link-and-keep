
import { createClient } from '@supabase/supabase-js';

// These are public keys, it's safe to include them in the frontend code
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
