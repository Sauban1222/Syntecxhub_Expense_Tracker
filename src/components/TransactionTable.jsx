import {
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CarFront,
  Clapperboard,
  HeartPulse,
  Laptop,
  MoreHorizontal,
  ReceiptText,
  ShoppingBag,
  Trash2,
  Utensils,
  Wallet,
  ShoppingCart,
  Fuel,
  Wifi,
  Landmark,
  Stethoscope,
  Bus,
  Zap,
  Plane,
  House,
} from 'lucide-react';
import { CATEGORY_COLORS, formatCurrency, formatDate, getCategoryClassName } from '../utils/finance.js';

const categoryIcons = {
  Groceries: ShoppingCart,
  Food: Utensils,
  Shopping: ShoppingBag,
  Fuel,
  'Internet & Mobile': Wifi,
  'Loan Repayment': Landmark,
  'Medical Expenses': Stethoscope,
  'Dining Out': Utensils,
  Transport: Bus,
  'Electricity Bill': Zap,
  Travel: Plane,
  Rent: House,
  'Bills & Utilities': ReceiptText,
  Transportation: CarFront,
  Entertainment: Clapperboard,
  Healthcare: HeartPulse,
  Education: BookOpen,
  Bills: ReceiptText,
  Salary: BriefcaseBusiness,
  Freelancing: Laptop,
  Other: Wallet,
};

export default function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  onViewAll,
  compact = false,
  loading = false,
  currency = 'USD',
}) {
  if (loading) {
    return (
      <div className={`transaction-loading ${compact ? 'compact-loading' : ''}`} role="status">
        <span className="loading-spinner" />
        <span>Loading your transactions...</span>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className={`transaction-table ${compact ? 'transaction-table-compact' : ''}`}>
        <caption className="sr-only">{compact ? 'Recent transactions' : 'All transactions'}</caption>
        <thead>
          <tr>
            <th scope="col">Transaction</th>
            <th scope="col">Category</th>
            <th scope="col">Date</th>
            <th scope="col">Amount</th>
            {!compact && <th scope="col" className="action-heading">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const Icon = categoryIcons[transaction.category] || Wallet;
            const categoryClass = getCategoryClassName(transaction.category);
            const isIncome = transaction.type === 'income';
            return (
              <tr key={transaction.id}>
                <td>
                  <div className="transaction-name">
                    <div
                      className={`transaction-icon transaction-icon-${categoryClass}`}
                      style={{ '--category-color': CATEGORY_COLORS[transaction.category] || CATEGORY_COLORS.Other }}
                    >
                      <Icon size={17} strokeWidth={1.8} />
                    </div>
                    <div className="transaction-description">
                      <strong>{transaction.description}</strong>
                      <span>{isIncome ? 'Income' : 'Expense'}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="category-label">
                    <span
                      className={`category-dot category-dot-${categoryClass}`}
                      style={{ backgroundColor: CATEGORY_COLORS[transaction.category] || CATEGORY_COLORS.Other }}
                    />
                    {transaction.category}
                  </span>
                </td>
                <td className="date-cell">{formatDate(transaction.date)}</td>
                <td>
                  <span className={`amount-value ${isIncome ? 'amount-income' : ''}`}>
                    {isIncome ? '+' : '−'}{formatCurrency(transaction.amount, currency)}
                  </span>
                </td>
                {!compact && (
                  <td>
                    <div className="row-actions">
                      <button className="icon-button row-action" title="Edit transaction" aria-label={`Edit ${transaction.description}`} onClick={() => onEdit(transaction)}>
                        <MoreHorizontal size={17} />
                      </button>
                      <button className="icon-button row-action delete-action" title="Delete transaction" aria-label={`Delete ${transaction.description}`} onClick={() => onDelete(transaction.id)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {!transactions.length && (
        <div className="empty-state">
          <div className="empty-icon"><ArrowDownLeft size={22} /></div>
          <strong>No transactions yet</strong>
          <span>Your latest activity will show up here.</span>
        </div>
      )}
      {compact && transactions.length > 0 && (
        <button className="table-view-all" onClick={onViewAll}>
          View all transactions <ArrowUpRight size={15} />
        </button>
      )}
    </div>
  );
}
