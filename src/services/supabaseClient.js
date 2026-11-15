import { createClient } from '@supabase/supabase-js';
import { createAuthStorage } from './authStorage.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';
let configurationError = '';
let supabase = null;

const authStorage = createAuthStorage(localStorage, sessionStorage);

if (!supabaseUrl || !supabaseAnonKey) {
  configurationError = 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your local environment to enable accounts.';
} else {
  try {
    const parsedUrl = new URL(supabaseUrl);
    const localHost = ['localhost', '127.0.0.1'].includes(parsedUrl.hostname);
    if (parsedUrl.protocol !== 'https:' && !localHost) {
      throw new Error('The Supabase URL must use HTTPS.');
    }
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: authStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
  } catch (error) {
    configurationError = `Supabase configuration is invalid. ${error.message}`;
  }
}

export const isSupabaseConfigured = Boolean(supabase);
export const supabaseConfigurationError = configurationError;
export { supabase };

export function setSessionPersistence(rememberMe) {
  authStorage.setPersistence(rememberMe);
}
