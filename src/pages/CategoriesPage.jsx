import {
  Apple,
  Banknote,
  BookOpen,
  Bus,
  CarFront,
  Clapperboard,
  Fuel,
  HeartPulse,
  House,
  Laptop,
  Landmark,
  Lightbulb,
  Plane,
  ReceiptText,
  ShoppingBag,
  ShoppingCart,
  Utensils,
  Wallet,
  Wifi,
} from 'lucide-react';
import {
  CATEGORY_COLORS,
  getCategoriesWithHistory,
  formatCurrency,
} from '../utils/finance.js';

const categoryIcons = {
  Groceries: Apple,
  Food: Utensils,
  Shopping: ShoppingBag,
  Fuel,
  'Internet & Mobile': Wifi,
  'Loan Repayment': Landmark,
  'Medical Expenses': HeartPulse,
  'Dining Out': Utensils,
  Transport: Bus,
  'Electricity Bill': Lightbulb,
  Travel: Plane,
  Rent: House,
  'Bills & Utilities': ReceiptText,
  Transportation: CarFront,
  Entertainment: Clapperboard,
  Healthcare: HeartPulse,
  Education: BookOpen,
  Bills: ReceiptText,
  Salary: Banknote,
  Freelancing: Laptop,
  Other: Wallet,
};

export default function CategoriesPage({ transactions, currency, onViewCategory }) {
  const categories = getCategoriesWithHistory(transactions);

  return (
    <div className="page-content categories-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR MONEY, ORGANIZED</div>
          <h1>Categories</h1>
          <p>Explore your spending and income by category.</p>
        </div>
      </div>
      <section className="category-cards-grid" aria-label="Transaction categories">
        {categories.map((category) => {
          const Icon = categoryIcons[category] || Wallet;
          const entries = transactions.filter((item) => item.category === category);
          const expense = entries.reduce(
            (total, item) => total + (item.type === 'expense' ? Number(item.amount) : 0),
            0,
          );
          const income = entries.reduce(
            (total, item) => total + (item.type === 'income' ? Number(item.amount) : 0),
            0,
          );

          return (
            <article className="panel category-card" key={category}>
              <div className="category-card-top">
                <span
                  className={`category-card-icon category-icon-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  style={{ '--category-color': CATEGORY_COLORS[category] || CATEGORY_COLORS.Other }}
                >
                  <Icon size={19} strokeWidth={1.8} />
                </span>
                <span className="category-entry-count">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
              </div>
              <h2>{category}</h2>
              <div className="category-card-totals">
                <span>Expenses <strong>{formatCurrency(expense, currency)}</strong></span>
                <span>Income <strong>{formatCurrency(income, currency)}</strong></span>
              </div>
              <button className="category-card-link" onClick={() => onViewCategory(category)}>
                View transactions <ShoppingCart size={14} />
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}
