import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthStorage } from '../src/services/authStorage.js';
import {
  signInWithPersistence,
  signOutWithLocalFallback,
} from '../src/services/authActions.js';

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
    clear() {
      values.clear();
    },
  };
}

test('Remember Me stores sessions in localStorage and restores them after restart', () => {
  const localStore = createMemoryStorage();
  const sessionStore = createMemoryStorage();
  const authStorage = createAuthStorage(localStore, sessionStore);

  authStorage.setPersistence(true);
  authStorage.setItem('auth-token', 'remembered-session');

  const restartedStorage = createAuthStorage(localStore, createMemoryStorage());
  assert.equal(restartedStorage.getItem('auth-token'), 'remembered-session');
  assert.equal(sessionStore.getItem('auth-token'), null);
});

test('unchecked Remember Me stores sessions in sessionStorage only', () => {
  const localStore = createMemoryStorage();
  const sessionStore = createMemoryStorage();
  const authStorage = createAuthStorage(localStore, sessionStore);

  authStorage.setPersistence(false);
  authStorage.setItem('auth-token', 'tab-session');

  const reloadedStorage = createAuthStorage(localStore, sessionStore);
  assert.equal(reloadedStorage.getItem('auth-token'), 'tab-session');
  assert.equal(localStore.getItem('auth-token'), null);

  sessionStore.clear();
  const nextBrowserSession = createAuthStorage(localStore, sessionStore);
  assert.equal(nextBrowserSession.getItem('auth-token'), null);
});

test('changing Remember Me moves an existing session to the selected store', () => {
  const localStore = createMemoryStorage();
  const sessionStore = createMemoryStorage();
  const authStorage = createAuthStorage(localStore, sessionStore);

  authStorage.setPersistence(true);
  authStorage.setItem('auth-token', 'current-session');
  authStorage.setPersistence(false);

  assert.equal(localStore.getItem('auth-token'), null);
  assert.equal(sessionStore.getItem('auth-token'), 'current-session');
});

test('removing an auth session clears both storage backends', () => {
  const localStore = createMemoryStorage();
  const sessionStore = createMemoryStorage();
  const authStorage = createAuthStorage(localStore, sessionStore);

  localStore.setItem('auth-token', 'persistent-session');
  sessionStore.setItem('auth-token', 'tab-session');
  authStorage.removeItem('auth-token');

  assert.equal(localStore.getItem('auth-token'), null);
  assert.equal(sessionStore.getItem('auth-token'), null);
});

test('login applies the requested persistence mode before calling Supabase', async () => {
  const calls = [];
  const result = await signInWithPersistence({
    auth: {
      async signInWithPassword(credentials) {
        calls.push(['signIn', credentials]);
        return { data: { session: 'signed-in' }, error: null };
      },
    },
    setPersistence: (rememberMe) => calls.push(['persistence', rememberMe]),
    email: 'test@example.invalid',
    password: 'test-password',
    rememberMe: false,
  });

  assert.deepEqual(calls.map(([name]) => name), ['persistence', 'signIn']);
  assert.equal(calls[0][1], false);
  assert.equal(result.session, 'signed-in');
});

test('login surfaces Supabase authentication errors', async () => {
  const error = new Error('Invalid login credentials');

  await assert.rejects(
    signInWithPersistence({
      auth: { signInWithPassword: async () => ({ data: null, error }) },
      setPersistence() {},
      email: 'test@example.invalid',
      password: 'incorrect-password',
      rememberMe: true,
    }),
    error,
  );
});

test('logout awaits remote revocation when Supabase succeeds', async () => {
  const calls = [];
  const result = await signOutWithLocalFallback({
    async signOut(options) {
      calls.push(options);
      return { error: null };
    },
  });

  assert.deepEqual(calls, [undefined]);
  assert.deepEqual(result, { remoteRevoked: true });
});

test('logout clears the local session but reports failed remote revocation', async () => {
  const calls = [];
  const result = await signOutWithLocalFallback({
    async signOut(options) {
      calls.push(options);
      if (!options) throw new Error('Network unavailable');
      return { error: null };
    },
  });

  assert.deepEqual(calls, [undefined, { scope: 'local' }]);
  assert.deepEqual(result, {
    remoteRevoked: false,
    error: 'Network unavailable',
  });
});

test('logout reports a local cleanup failure instead of claiming success', async () => {
  const calls = [];
  await assert.rejects(
    signOutWithLocalFallback({
      async signOut(options) {
        calls.push(options);
        if (!options) return { error: new Error('Remote unavailable') };
        return { error: new Error('Local cleanup failed') };
      },
    }),
    /local sign-out failed \(Local cleanup failed\)/,
  );
  assert.deepEqual(calls, [undefined, { scope: 'local' }]);
});
