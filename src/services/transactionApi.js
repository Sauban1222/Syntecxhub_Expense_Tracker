import { supabase } from './supabaseClient.js';

const API_URL = '/api/transactions';
const STORAGE_KEY = 'spendly-transactions-v1';

async function request(path = '', options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Transaction API returned ${response.status}.`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function readLocalTransactions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      throw new Error('Saved transactions are not in a valid format.');
    }
    return parsed;
  } catch (error) {
    throw new Error(`Unable to read saved transactions: ${error.message}`);
  }
}

function writeLocalTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    throw new Error(`Unable to save transactions in this browser: ${error.message}`);
  }
}

export const transactionApi = {
  getAll: () => request(),
  create: (transaction) =>
    request('', { method: 'POST', body: JSON.stringify(transaction) }),
  update: (id, transaction) =>
    request(`/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    }),
  remove: (id) =>
    request(`/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

function validateUserId(userId) {
  if (!userId) throw new Error('You must be signed in to access transactions.');
}

function throwSupabaseError(error) {
  if (error) throw new Error(error.message || 'The Supabase transaction request failed.');
}

const transactionColumns = 'id, user_id, description, amount, category, date, type, created_at, updated_at';

export const supabaseTransactionApi = {
  async getAll(userId) {
    validateUserId(userId);
    const { data, error } = await supabase
      .from('transactions')
      .select(transactionColumns)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    throwSupabaseError(error);
    return data.map((transaction) => ({ ...transaction, amount: Number(transaction.amount) }));
  },
  async create(userId, transaction) {
    validateUserId(userId);
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        description: transaction.description,
        amount: Number(transaction.amount),
        category: transaction.category,
        date: transaction.date,
        type: transaction.type,
      })
      .select(transactionColumns)
      .single();
    throwSupabaseError(error);
    return { ...data, amount: Number(data.amount) };
  },
  async update(userId, id, updates) {
    validateUserId(userId);
    const { data, error } = await supabase
      .from('transactions')
      .update({
        description: updates.description,
        amount: Number(updates.amount),
        category: updates.category,
        date: updates.date,
        type: updates.type,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select(transactionColumns)
      .single();
    throwSupabaseError(error);
    return { ...data, amount: Number(data.amount) };
  },
  async remove(userId, id) {
    validateUserId(userId);
    const { data, error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();
    throwSupabaseError(error);
    if (!data) throw new Error('Transaction was not found or is not accessible.');
  },
};

export const localTransactionStore = {
  getAll: readLocalTransactions,
  save: writeLocalTransactions,
};
