import { useCallback, useEffect, useState } from 'react';

export const AVAILABLE_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'];
const PREFERENCES_KEY = 'spendly-preferences-v1';

export default function usePreferences(userId = null) {
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState('');
  const storageKey = userId ? `${PREFERENCES_KEY}:${userId}` : PREFERENCES_KEY;

  useEffect(() => {
    setCurrency('USD');
    setError('');
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) {
        setCurrency('USD');
        return;
      }
      const preferences = JSON.parse(saved);
      if (!AVAILABLE_CURRENCIES.includes(preferences.currency)) {
        throw new Error('Saved currency preference is not supported.');
      }
      setCurrency(preferences.currency);
    } catch (storageError) {
      setError(`Unable to load your display preferences. ${storageError.message}`);
    }
  }, [storageKey]);

  const updateCurrency = useCallback((nextCurrency) => {
    if (!AVAILABLE_CURRENCIES.includes(nextCurrency)) {
      throw new Error('Choose a supported currency.');
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify({ currency: nextCurrency }));
      setCurrency(nextCurrency);
      setError('');
    } catch (storageError) {
      const message = `Unable to save your display preference. ${storageError.message}`;
      setError(message);
      throw new Error(message);
    }
  }, [storageKey]);

  const clearError = useCallback(() => setError(''), []);

  return { currency, updateCurrency, error, clearError };
}
