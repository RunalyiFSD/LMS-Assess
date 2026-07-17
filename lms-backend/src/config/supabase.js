const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '[Supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set in environment variables. ' +
    'Supabase client will not be available. Add these to lms-backend/.env before Sprint 2.'
  );
}

/**
 * Supabase Admin Client
 *
 * Uses the service role key — bypasses Row Level Security (RLS).
 * This is the server-side client used exclusively in the Express backend.
 *
 * NEVER expose this client or the service role key to the frontend.
 * The frontend should use the anon key with Supabase Auth session tokens.
 */
const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

module.exports = supabase;
