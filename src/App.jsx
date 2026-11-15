import { useCallback, useMemo, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import TransactionModal from './components/TransactionModal.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import useAuth from './hooks/useAuth.js';
import useTransactions from './hooks/useTransactions.js';
import usePreferences from './hooks/usePreferences.js';
import { getDashboardGreeting, getUserDisplayName } from './utils/userGreeting.js';
import {
  isSupabaseConfigured,
  supabaseConfigurationError,
} from './services/supabaseClient.js';

const pageTitles = {
  dashboard: 'Dashboard',
  transactions: 'Transactions',
  analytics: 'Analytics',
  categories: 'Categories',
  settings: 'Settings',
};

export default function App() {
  const auth = useAuth();
  const [demoMode, setDemoMode] = useState(false);
  const [accountActionError, setAccountActionError] = useState('');
  const userId = auth.session?.user?.id || null;
  const {
    transactions,
    loading,
    error,
    storageMode,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    clearError,
  } = useTransactions({ userId, demoMode: !isSupabaseConfigured && demoMode });
  const {
    currency,
    updateCurrency,
    error: preferencesError,
    clearError: clearPreferencesError,
  } = usePreferences(userId);
  const [activePage, setActivePage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [categoryPreset, setCategoryPreset] = useState('all');
  const currentUser = auth.session?.user;
  const userEmail = currentUser?.email || '';
  const userName = getUserDisplayName(currentUser) || 'Spendly user';
  const dashboardGreeting = getDashboardGreeting(currentUser);
  const userInitials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'JD';
  const visibleError = error || preferencesError || accountActionError || auth.error;

  const financialStats = useMemo(() => transactions.reduce(
    (totals, transaction) => {
      const amount = Number(transaction.amount) || 0;
      if (transaction.type === 'income') {
        totals.income += amount;
      } else {
        totals.expenses += amount;
      }
      return totals;
    },
    { income: 0, expenses: 0 },
  ), [transactions]);

  const stats = useMemo(() => ({
    ...financialStats,
    balance: financialStats.income - financialStats.expenses,
  }), [financialStats]);

  const navigate = useCallback((page) => {
    setActivePage(page);
  }, []);

  const leaveAccount = useCallback(async () => {
    setAccountActionError('');
    if (!isSupabaseConfigured) {
      setDemoMode(false);
      return;
    }
    try {
      const result = await auth.signOut();
      if (!result.remoteRevoked) {
        setAccountActionError(
          `Signed out on this device, but Supabase could not confirm remote token revocation. ${result.error}`,
        );
      }
    } catch (signOutError) {
      setAccountActionError(`Unable to sign out. ${signOutError.message}`);
    }
  }, [auth.signOut]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setCategoryPreset('all');
  }, []);

  const viewCategory = useCallback((category) => {
    setCategoryPreset(category);
    setSearchQuery('');
    setActivePage('transactions');
  }, []);

  const openNewTransaction = useCallback(() => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  }, []);

  const openEditTransaction = useCallback((transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  }, []);

  const closeTransactionModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  }, []);

  const saveTransaction = useCallback(async (transaction) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, transaction);
    } else {
      await createTransaction(transaction);
    }
  }, [editingTransaction, updateTransaction, createTransaction]);

  const removeTransaction = useCallback(async (id) => {
    const transaction = transactions.find((item) => String(item.id) === String(id));
    if (!transaction) return;
    if (window.confirm(`Delete “${transaction.description}”? This cannot be undone.`)) {
      try {
        await deleteTransaction(id);
      } catch {
        // The hook exposes persistence failures in the API status banner.
      }
    }
  }, [transactions, deleteTransaction]);

  if (auth.loading) {
    return <main className="auth-loading" role="status">Preparing your secure Spendly session…</main>;
  }

  const needsAuthentication = auth.passwordRecovery
    || (isSupabaseConfigured && !auth.session)
    || (!isSupabaseConfigured && !demoMode);

  if (needsAuthentication) {
    return (
      <AuthPage
        onSignIn={auth.signIn}
        onSignUp={auth.signUp}
        onRequestPasswordReset={auth.requestPasswordReset}
        onUpdatePassword={auth.updatePassword}
        onContinueDemo={!isSupabaseConfigured && import.meta.env.DEV ? () => setDemoMode(true) : undefined}
        authError={visibleError}
        configurationError={supabaseConfigurationError}
        passwordRecovery={auth.passwordRecovery}
        onClearError={() => { auth.clearError(); setAccountActionError(''); }}
      />
    );
  }

  let page;
  if (activePage === 'transactions') {
    page = (
      <TransactionsPage
        transactions={transactions}
        loading={loading}
        searchQuery={searchQuery}
        initialCategory={categoryPreset}
        onEdit={openEditTransaction}
        onDelete={removeTransaction}
        onAdd={openNewTransaction}
        onClearSearch={clearSearch}
        currency={currency}
      />
    );
  } else if (activePage === 'analytics') {
    page = <AnalyticsPage transactions={transactions} currency={currency} />;
  } else if (activePage === 'categories') {
    page = <CategoriesPage transactions={transactions} currency={currency} onViewCategory={viewCategory} />;
  } else if (activePage === 'settings') {
    page = (
      <SettingsPage
        currency={currency}
        onSaveCurrency={updateCurrency}
        isAuthenticated={Boolean(auth.session)}
        accountEmail={userEmail}
      />
    );
  } else {
    page = (
      <DashboardPage
        transactions={transactions}
        loading={loading}
        stats={stats}
        storageMode={storageMode}
        currency={currency}
        greeting={dashboardGreeting}
        onAdd={openNewTransaction}
        onNavigate={navigate}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={navigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userName={userName}
        userEmail={userEmail}
        userInitials={userInitials}
        isAuthenticated={Boolean(auth.session)}
        onSignOut={leaveAccount}
      />
      <main className="main-shell">
        <Topbar
          activePage={pageTitles[activePage]}
          onAdd={openNewTransaction}
          onMenu={() => setIsSidebarOpen(true)}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
          onNavigate={navigate}
          userName={userName}
          userInitials={userInitials}
        />
        {visibleError && (
          <div className="api-notice" role="status">
            <AlertTriangle size={17} />
            <span>{visibleError}</span>
            <button
              className="icon-button"
              aria-label="Dismiss application status"
              onClick={() => { clearError(); clearPreferencesError(); }}
            >
              <X size={16} />
            </button>
          </div>
        )}
        {page}
      </main>
      {isModalOpen && (
        <TransactionModal
          transaction={editingTransaction}
          currency={currency}
          onClose={closeTransactionModal}
          onSave={saveTransaction}
        />
      )}
    </div>
  );
}
