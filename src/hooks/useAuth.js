import { useCallback, useEffect, useState } from 'react';
import {
  isSupabaseConfigured,
  setSessionPersistence,
  supabase,
} from '../services/supabaseClient.js';
import {
  signInWithPersistence,
  signOutWithLocalFallback,
} from '../services/authActions.js';

export default function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState('');
  const [passwordRecovery, setPasswordRecovery] = useState(
    typeof window !== 'undefined' && window.location.hash.includes('type=recovery'),
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let active = true;

    supabase.auth.getSession()
      .then(({ data, error: sessionError }) => {
        if (sessionError) throw sessionError;
        if (active) setSession(data.session);
      })
      .catch((sessionError) => {
        if (active) setError(`Unable to restore your Supabase session. ${sessionError.message}`);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      if (event === 'SIGNED_OUT') setPasswordRecovery(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email, password, rememberMe) => {
    if (!supabase) throw new Error('Supabase authentication is not configured.');
    setError('');
    return signInWithPersistence({
      auth: supabase.auth,
      setPersistence: setSessionPersistence,
      email,
      password,
      rememberMe,
    });
  }, []);

  const signUp = useCallback(async (fullName, email, password) => {
    if (!supabase) throw new Error('Supabase authentication is not configured.');
    setSessionPersistence(true);
    setError('');
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: window.location.origin,
      },
    });
    if (signUpError) throw signUpError;
    return data;
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    if (!supabase) throw new Error('Supabase authentication is not configured.');
    setError('');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (resetError) throw resetError;
  }, []);

  const updatePassword = useCallback(async (password) => {
    if (!supabase) throw new Error('Supabase authentication is not configured.');
    setError('');
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) throw updateError;
    setPasswordRecovery(false);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) throw new Error('Supabase authentication is not configured.');
    setError('');
    return signOutWithLocalFallback(supabase.auth);
  }, []);

  const clearError = useCallback(() => setError(''), []);

  return {
    session,
    loading,
    error,
    passwordRecovery,
    signIn,
    signUp,
    requestPasswordReset,
    updatePassword,
    signOut,
    clearError,
  };
}
