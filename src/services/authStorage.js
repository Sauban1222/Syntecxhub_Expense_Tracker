const PERSISTENCE_KEY = 'spendly-auth-persistence-v1';

export function createAuthStorage(localStore, sessionStore) {
  const knownKeys = new Set();

  function getPreferredStore(key) {
    if (sessionStore.getItem(PERSISTENCE_KEY) === 'session') return sessionStore;
    if (localStore.getItem(PERSISTENCE_KEY) === 'local') return localStore;
    if (localStore.getItem(key) !== null) return localStore;
    if (sessionStore.getItem(key) !== null) {
      sessionStore.setItem(PERSISTENCE_KEY, 'session');
      return sessionStore;
    }
    return localStore;
  }

  function getOtherStore(store) {
    return store === localStore ? sessionStore : localStore;
  }

  return {
    getItem(key) {
      knownKeys.add(key);
      const store = getPreferredStore(key);
      const otherStore = getOtherStore(store);
      const value = store.getItem(key);
      if (value !== null) return value;

      const legacyValue = otherStore.getItem(key);
      if (legacyValue === null) return null;
      store.setItem(key, legacyValue);
      otherStore.removeItem(key);
      return legacyValue;
    },
    setItem(key, value) {
      knownKeys.add(key);
      const store = getPreferredStore(key);
      store.setItem(key, value);
      getOtherStore(store).removeItem(key);
    },
    removeItem(key) {
      localStore.removeItem(key);
      sessionStore.removeItem(key);
      knownKeys.delete(key);
    },
    setPersistence(rememberMe) {
      const store = rememberMe ? localStore : sessionStore;
      const otherStore = getOtherStore(store);
      store.setItem(PERSISTENCE_KEY, rememberMe ? 'local' : 'session');
      otherStore.removeItem(PERSISTENCE_KEY);

      for (const key of knownKeys) {
        const value = store.getItem(key) ?? otherStore.getItem(key);
        if (value !== null) store.setItem(key, value);
        otherStore.removeItem(key);
      }
    },
  };
}
