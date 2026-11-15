export async function signInWithPersistence({
  auth,
  setPersistence,
  email,
  password,
  rememberMe,
}) {
  setPersistence(rememberMe);
  const { data, error } = await auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutWithLocalFallback(auth) {
  let remoteError;
  try {
    const { error } = await auth.signOut();
    remoteError = error;
  } catch (error) {
    remoteError = error;
  }

  if (!remoteError) return { remoteRevoked: true };

  try {
    const { error: localError } = await auth.signOut({ scope: 'local' });
    if (localError) throw localError;
  } catch (localError) {
    throw new Error(
      `Remote sign-out failed (${remoteError.message || 'network error'}), and local sign-out failed (${localError.message || 'unknown error'}).`,
    );
  }

  return {
    remoteRevoked: false,
    error: remoteError.message || 'A network error prevented remote token revocation.',
  };
}
