// Admin client with service role access for bypassing RLS policies
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://btfltugyiniesjnbtfwi.supabase.co";
// This should be a service role key, not the anon key
// In a production environment, this should be accessed through a secure backend API
// For now, we're using a placeholder - you'll need to replace this with your actual service role key
const SUPABASE_SERVICE_ROLE_KEY = "YOUR_SUPABASE_SERVICE_ROLE_KEY";

export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
