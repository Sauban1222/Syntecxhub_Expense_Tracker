import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CATEGORIES,
  DEFAULT_TRANSACTION_CATEGORY,
  LEGACY_CATEGORIES,
  createMonthlyOverview,
  formatCurrency,
  getCategoriesWithHistory,
  getCategoryClassName,
  getCategoryExpenses,
  getCurrentDate,
  getCurrencySymbol,
  getMonthKey,
  getPercentageChange,
  getTransactionCategoryOptions,
} from '../src/utils/finance.js';

function shiftMonth(date, offset) {
  const [year, month] = date.split('-').map(Number);
  const shifted = new Date(year, month - 1 + offset, 15);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}-15`;
}

test('monthly overview groups transactions into the correct month and type', () => {
  const currentDate = getCurrentDate();
  const previousDate = shiftMonth(currentDate, -1);
  const overview = createMonthlyOverview([
    { date: currentDate, amount: 1200, type: 'income' },
    { date: currentDate, amount: 350, type: 'expense' },
    { date: previousDate, amount: 800, type: 'income' },
    { date: previousDate, amount: 275, type: 'expense' },
  ]);
  const currentMonth = overview.find((month) => month.key === getMonthKey(currentDate));
  const previousMonth = overview.find((month) => month.key === getMonthKey(previousDate));

  assert.deepEqual(
    { income: currentMonth.income, expenses: currentMonth.expenses },
    { income: 1200, expenses: 350 },
  );
  assert.deepEqual(
    { income: previousMonth.income, expenses: previousMonth.expenses },
    { income: 800, expenses: 275 },
  );
});

test('category breakdown sums expenses only and handles newly added categories', () => {
  const breakdown = getCategoryExpenses([
    { category: 'Groceries', amount: 40, type: 'expense' },
    { category: 'Groceries', amount: 15, type: 'expense' },
    { category: 'Groceries', amount: 500, type: 'income' },
    { category: 'Internet & Mobile', amount: 60, type: 'expense' },
  ]);

  assert.deepEqual(
    breakdown.map(({ name, value }) => ({ name, value })),
    [{ name: 'Internet & Mobile', value: 60 }, { name: 'Groceries', value: 55 }],
  );
  assert.equal(getCategoryClassName('Internet & Mobile'), 'internet-and-mobile');
});

test('percentage comparisons avoid misleading values without a baseline', () => {
  assert.equal(getPercentageChange(120, 100), 20);
  assert.equal(getPercentageChange(80, 100), -20);
  assert.equal(getPercentageChange(50, 0), null);
});

test('currency display follows the selected currency preference', () => {
  assert.match(formatCurrency(1234.5, 'EUR'), /1,234\.50/);
  assert.equal(getCurrencySymbol('USD'), '$');
});

test('new transactions use exactly the required 17 categories', () => {
  assert.deepEqual(CATEGORIES, [
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
  ]);
  assert.equal(CATEGORIES.length, 17);
});

test('new transaction category defaults to Groceries', () => {
  assert.equal(DEFAULT_TRANSACTION_CATEGORY, 'Groceries');
  assert.deepEqual(getTransactionCategoryOptions(), CATEGORIES);
});

test('historical legacy categories remain available without entering new selections', () => {
  const transactions = [
    { category: 'Food' },
    { category: 'Transportation' },
    { category: 'Healthcare' },
    { category: 'Bills' },
    { category: 'Food' },
  ];
  const availableCategories = getCategoriesWithHistory(transactions);

  assert.deepEqual(availableCategories.slice(0, CATEGORIES.length), CATEGORIES);
  assert.deepEqual(availableCategories.slice(CATEGORIES.length), [
    ...LEGACY_CATEGORIES,
  ]);
  assert.deepEqual(getTransactionCategoryOptions(), CATEGORIES);
  assert.deepEqual(getTransactionCategoryOptions('Food'), ['Food', ...CATEGORIES]);
});
