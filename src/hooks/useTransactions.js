import { useCallback, useEffect, useRef, useState } from 'react';
import {
  localTransactionStore,
  supabaseTransactionApi,
  transactionApi,
} from '../services/transactionApi.js';

export default function useTransactions({ userId = null, demoMode = false } = {}) {
  const [transactions, setTransactions] = useState([]);
  const transactionsRef = useRef(transactions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [storageMode, setStorageMode] = useState('idle');

  const commitTransactions = useCallback((nextTransactions) => {
    transactionsRef.current = nextTransactions;
    setTransactions(nextTransactions);
  }, []);

  const persistLocally = useCallback((nextTransactions) => {
    try {
      localTransactionStore.save(nextTransactions);
    } catch (storageError) {
      setError(storageError.message);
      throw storageError;
    }
  }, []);

  useEffect(() => {
    let active = true;
    const mode = userId ? 'supabase' : demoMode ? 'api' : 'idle';

    transactionsRef.current = [];
    setTransactions([]);
    setStorageMode(mode);
    setError('');
    setLoading(mode !== 'idle');

    if (mode === 'idle') return () => { active = false; };

    async function loadTransactions() {
      try {
        if (mode === 'supabase') {
          const data = await supabaseTransactionApi.getAll(userId);
          if (!Array.isArray(data)) throw new Error('Supabase returned an invalid transaction response.');
          if (active) {
            commitTransactions(data);
            setError('');
          }
          return;
        }

        const data = await transactionApi.getAll();
        if (!Array.isArray(data)) {
          throw new Error('The transaction API returned an invalid response.');
        }
        if (active) {
          commitTransactions(data);
          setStorageMode('api');
          try {
            localTransactionStore.save(data);
            setError('');
          } catch (storageError) {
            setError(storageError.message);
          }
        }
      } catch (apiError) {
        if (mode === 'supabase') {
          if (active) setError(`Could not load your account transactions. ${apiError.message}`);
          return;
        }
        try {
          const savedTransactions = localTransactionStore.getAll();
          if (active) {
            commitTransactions(savedTransactions);
            setStorageMode('local');
            setError(`Mock API unavailable. Using browser-saved data instead. ${apiError.message}`);
          }
        } catch (storageError) {
          if (active) setError(`${apiError.message} ${storageError.message}`);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTransactions();
    return () => {
      active = false;
    };
  }, [userId, demoMode, commitTransactions]);

  const createTransaction = useCallback(async (transaction) => {
    if (userId) {
      try {
        const created = await supabaseTransactionApi.create(userId, transaction);
        const next = [created, ...transactionsRef.current];
        commitTransactions(next);
        setStorageMode('supabase');
        setError('');
        return;
      } catch (apiError) {
        setError(`Could not save your transaction to Supabase. ${apiError.message}`);
        throw apiError;
      }
    }
    if (!demoMode) throw new Error('Continue to the demo workspace or sign in before adding transactions.');

    const entry = { ...transaction, id: transaction.id || crypto.randomUUID() };
    if (storageMode === 'api') {
      try {
        const created = await transactionApi.create(entry);
        const next = [created, ...transactionsRef.current];
        commitTransactions(next);
        try {
          persistLocally(next);
        } catch {
          return;
        }
        setError('');
        return;
      } catch (apiError) {
        setStorageMode('local');
        setError(`Could not save to the mock API. Changes are being saved in this browser. ${apiError.message}`);
      }
    }

    const next = [entry, ...transactionsRef.current];
    persistLocally(next);
    commitTransactions(next);
  }, [userId, demoMode, storageMode, persistLocally, commitTransactions]);

  const updateTransaction = useCallback(async (id, updates) => {
    if (userId) {
      try {
        const updated = await supabaseTransactionApi.update(userId, id, updates);
        const next = transactionsRef.current.map((item) => (String(item.id) === String(id) ? updated : item));
        commitTransactions(next);
        setStorageMode('supabase');
        setError('');
        return;
      } catch (apiError) {
        setError(`Could not update your transaction in Supabase. ${apiError.message}`);
        throw apiError;
      }
    }
    if (!demoMode) throw new Error('Continue to the demo workspace or sign in before editing transactions.');

    if (storageMode === 'api') {
      try {
        const updated = await transactionApi.update(id, updates);
        const next = transactionsRef.current.map((item) => (String(item.id) === String(id) ? updated : item));
        commitTransactions(next);
        try {
          persistLocally(next);
        } catch {
          return;
        }
        setError('');
        return;
      } catch (apiError) {
        setStorageMode('local');
        setError(`Could not update the mock API. Changes are being saved in this browser. ${apiError.message}`);
      }
    }

    const next = transactionsRef.current.map((item) =>
      String(item.id) === String(id) ? { ...item, ...updates, id } : item,
    );
    persistLocally(next);
    commitTransactions(next);
  }, [userId, demoMode, storageMode, persistLocally, commitTransactions]);

  const deleteTransaction = useCallback(async (id) => {
    if (userId) {
      try {
        await supabaseTransactionApi.remove(userId, id);
        const next = transactionsRef.current.filter((item) => String(item.id) !== String(id));
        commitTransactions(next);
        setStorageMode('supabase');
        setError('');
        return;
      } catch (apiError) {
        setError(`Could not delete your transaction from Supabase. ${apiError.message}`);
        throw apiError;
      }
    }
    if (!demoMode) throw new Error('Continue to the demo workspace or sign in before deleting transactions.');

    if (storageMode === 'api') {
      try {
        await transactionApi.remove(id);
        const next = transactionsRef.current.filter((item) => String(item.id) !== String(id));
        commitTransactions(next);
        try {
          persistLocally(next);
        } catch {
          return;
        }
        setError('');
        return;
      } catch (apiError) {
        setStorageMode('local');
        setError(`Could not delete from the mock API. Changes are being saved in this browser. ${apiError.message}`);
      }
    }

    const next = transactionsRef.current.filter((item) => String(item.id) !== String(id));
    persistLocally(next);
    commitTransactions(next);
  }, [userId, demoMode, storageMode, persistLocally, commitTransactions]);

  const clearError = useCallback(() => setError(''), []);

  return {
    transactions,
    loading,
    error,
    storageMode,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    clearError,
  };
}
