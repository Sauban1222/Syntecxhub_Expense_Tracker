export const CATEGORIES = [
  'Groceries',
  'Shopping',
  'Fuel',
  'Internet & Mobile',
  'Loan Repayment',
  'Medical Expenses',
  'Entertainment',
  'Dining Out',
  'Transport',
  'Electricity Bill',
  'Travel',
  'Rent',
  'Education',
  'Bills & Utilities',
  'Salary',
  'Freelancing',
  'Other',
];

export const LEGACY_CATEGORIES = ['Food', 'Transportation', 'Healthcare', 'Bills'];
export const DEFAULT_TRANSACTION_CATEGORY = 'Groceries';

export const CATEGORY_COLORS = {
  Groceries: '#22c55e',
  Food: '#fb923c',
  Shopping: '#a78bfa',
  Fuel: '#f97316',
  'Internet & Mobile': '#0ea5e9',
  'Loan Repayment': '#6366f1',
  'Medical Expenses': '#14b8a6',
  'Dining Out': '#f59e0b',
  Transport: '#38bdf8',
  'Electricity Bill': '#eab308',
  Travel: '#ec4899',
  Rent: '#8b5cf6',
  'Bills & Utilities': '#818cf8',
  Transportation: '#38bdf8',
  Entertainment: '#f472b6',
  Healthcare: '#34d399',
  Education: '#facc15',
  Bills: '#818cf8',
  Salary: '#22c55e',
  Freelancing: '#2dd4bf',
  Other: '#94a3b8',
};

export function getCategoriesWithHistory(transactions = []) {
  const historicalCategories = [...new Set(
    transactions
      .map((transaction) => transaction.category)
      .filter((category) => typeof category === 'string' && category.trim() && !CATEGORIES.includes(category)),
  )];
  return [...CATEGORIES, ...historicalCategories];
}

export function getTransactionCategoryOptions(existingCategory) {
  if (existingCategory && !CATEGORIES.includes(existingCategory)) {
    return [existingCategory, ...CATEGORIES];
  }
  return CATEGORIES;
}

export function formatCurrency(amount, currency = 'USD', options = {}) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    ...options,
  }).format(Number(amount) || 0);
}

export function formatCompactCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(amount) || 0);
}

export function getCurrencySymbol(currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency })
    .formatToParts(0)
    .find((part) => part.type === 'currency')?.value || currency;
}

export function getCategoryClassName(category = '') {
  return category
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

export function getCurrentDate() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export function getMonthKey(date) {
  const parsed = new Date(`${date}T00:00:00`);
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
}

export function getPercentageChange(current, previous) {
  const baseline = Number(previous);
  if (!Number.isFinite(baseline) || baseline === 0) return null;
  return Math.round(((Number(current) - baseline) / Math.abs(baseline)) * 100);
}

export function getMonthLabel(date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
}

export function createMonthlyOverview(transactions, monthCount = 6) {
  const today = new Date();
  const months = Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - monthCount + index + 1, 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      month: getMonthLabel(date),
      income: 0,
      expenses: 0,
    };
  });
  const monthByKey = new Map(months.map((month) => [month.key, month]));

  transactions.forEach((transaction) => {
    const month = monthByKey.get(getMonthKey(transaction.date));
    if (!month) return;
    month[transaction.type === 'income' ? 'income' : 'expenses'] += Number(transaction.amount);
  });

  return months;
}

export function getCategoryExpenses(transactions) {
  const categoryTotals = new Map();
  transactions
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      categoryTotals.set(
        transaction.category,
        (categoryTotals.get(transaction.category) || 0) + Number(transaction.amount),
      );
    });

  return Array.from(categoryTotals, ([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other,
  })).sort((a, b) => b.value - a.value);
}

