import { useMemo, useState } from 'react';
import { ArrowDownWideNarrow, ArrowUpDown, Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';
import TransactionTable from '../components/TransactionTable.jsx';
import { formatCurrency, getCategoriesWithHistory } from '../utils/finance.js';

export default function TransactionsPage({
  transactions,
  loading,
  searchQuery,
  onEdit,
  onDelete,
  onAdd,
  onClearSearch,
  currency = 'USD',
  initialCategory = 'all',
}) {
  const [category, setCategory] = useState(initialCategory);
  const [type, setType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState('newest');

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return transactions
      .filter((item) => !query || `${item.description} ${item.category} ${item.type}`.toLowerCase().includes(query))
      .filter((item) => category === 'all' || item.category === category)
      .filter((item) => type === 'all' || item.type === type)
      .filter((item) => !dateFrom || item.date >= dateFrom)
      .filter((item) => !dateTo || item.date <= dateTo)
      .sort((a, b) => {
        if (sort === 'oldest') return a.date.localeCompare(b.date);
        if (sort === 'amount-high') return Number(b.amount) - Number(a.amount);
        if (sort === 'amount-low') return Number(a.amount) - Number(b.amount);
        return b.date.localeCompare(a.date);
      });
  }, [transactions, searchQuery, category, type, dateFrom, dateTo, sort]);

  const total = useMemo(
    () => filteredTransactions.reduce((sum, item) => sum + Number(item.amount), 0),
    [filteredTransactions],
  );
  const transactionCounts = useMemo(() => transactions.reduce(
    (counts, transaction) => {
      counts[transaction.type] += 1;
      return counts;
    },
    { income: 0, expense: 0 },
  ), [transactions]);
  const availableCategories = useMemo(
    () => getCategoriesWithHistory(transactions),
    [transactions],
  );
  const hasFilters = category !== 'all' || type !== 'all' || dateFrom || dateTo || sort !== 'newest' || searchQuery;

  function resetFilters() {
    setCategory('all');
    setType('all');
    setDateFrom('');
    setDateTo('');
    setSort('newest');
    onClearSearch();
  }

  return (
    <div className="page-content transactions-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR MONEY, ALL IN ONE PLACE</div>
          <h1>Transactions</h1>
          <p>Keep track of every dollar coming in and going out.</p>
        </div>
        <button className="button button-primary" onClick={onAdd}><span className="plus-small">+</span> Add transaction</button>
      </div>

      <div className="transaction-overview">
        <div><span className="overview-label"><span className="overview-label-dot" /> All transactions</span><strong>{transactions.length}</strong><small>total entries</small></div>
        <div><span className="overview-label"><span className="overview-label-dot income-dot" /> Income</span><strong>{transactionCounts.income}</strong><small>records</small></div>
        <div><span className="overview-label"><span className="overview-label-dot expense-dot" /> Expenses</span><strong>{transactionCounts.expense}</strong><small>records</small></div>
      </div>

      <section className="panel all-transactions-panel">
        <div className="transaction-panel-heading">
          <div><h2>All transactions <span className="count-chip">{filteredTransactions.length}</span></h2><p>{searchQuery ? `Results matching “${searchQuery}”` : 'Review, search, and manage your activity.'}</p></div>
          <div className="transaction-total"><span>Filtered total</span><strong>{formatCurrency(total, currency)}</strong></div>
        </div>
        <div className="filter-toolbar">
          <span className="filter-label"><SlidersHorizontal size={15} /> FILTER BY</span>
          <label className="filter-control"><Filter size={14} /><select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{availableCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="filter-control type-filter"><select aria-label="Filter by transaction type" value={type} onChange={(event) => setType(event.target.value)}><option value="all">All types</option><option value="income">Income</option><option value="expense">Expense</option></select></label>
          <label className="filter-control date-filter"><span>From</span><input aria-label="Start date" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></label>
          <label className="filter-control date-filter"><span>To</span><input aria-label="End date" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></label>
          <label className="filter-control sort-filter"><ArrowDownWideNarrow size={14} /><select aria-label="Sort transactions" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="amount-high">Highest amount</option><option value="amount-low">Lowest amount</option></select></label>
          {hasFilters && <button className="reset-filter" onClick={resetFilters}><RotateCcw size={13} /> Reset</button>}
        </div>
        {dateFrom && dateTo && dateFrom > dateTo && <p className="filter-warning" role="status">The start date is after the end date, so no transactions will match.</p>}
        <TransactionTable transactions={filteredTransactions} loading={loading} onEdit={onEdit} onDelete={onDelete} currency={currency} />
      </section>
      <div className="results-note"><ArrowUpDown size={14} /> Showing {filteredTransactions.length} of {transactions.length} transactions</div>
    </div>
  );
}
