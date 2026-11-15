import { useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, CalendarRange, ChartNoAxesCombined, PiggyBank, TrendingDown } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  createMonthlyOverview,
  formatCompactCurrency,
  formatCurrency,
  getCategoryExpenses,
  getCurrentDate,
  getMonthKey,
  getPercentageChange,
} from '../utils/finance.js';

function AnalyticsTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      {payload.map((item) => <div className="tooltip-line" key={item.dataKey}><span style={{ backgroundColor: item.color }} />{item.name}<b>{formatCurrency(item.value, currency)}</b></div>)}
    </div>
  );
}

export default function AnalyticsPage({ transactions, currency = 'USD' }) {
  const monthlyData = useMemo(() => createMonthlyOverview(transactions, 6), [transactions]);
  const categories = useMemo(() => getCategoryExpenses(transactions), [transactions]);
  const totals = useMemo(() => {
    const currentKey = getMonthKey(getCurrentDate());
    const current = transactions.filter((item) => getMonthKey(item.date) === currentKey);
    const income = current.reduce((sum, item) => sum + (item.type === 'income' ? Number(item.amount) : 0), 0);
    const expenses = current.reduce((sum, item) => sum + (item.type === 'expense' ? Number(item.amount) : 0), 0);
    const previous = monthlyData[monthlyData.length - 2] || { income: 0, expenses: 0 };
    const month = monthlyData[monthlyData.length - 1] || { income: 0, expenses: 0 };
    const expenseChange = getPercentageChange(month.expenses, previous.expenses);
    return { income, expenses, saved: income - expenses, expenseChange };
  }, [transactions, monthlyData]);
  const categoryTotal = categories.reduce((sum, category) => sum + category.value, 0);
  const savingsRate = totals.income > 0 ? Math.round((totals.saved / totals.income) * 100) : 0;

  return (
    <div className="page-content analytics-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR FINANCIAL STORY</div>
          <h1>Analytics</h1>
          <p>A clearer picture of how you earn, spend, and save.</p>
        </div>
        <div className="analytics-period"><CalendarRange size={16} /><span>Last 6 months</span></div>
      </div>

      <section className="analytics-stats">
        <article className="analytics-stat"><div className="analytics-stat-icon analytics-purple"><ChartNoAxesCombined size={18} /></div><span>Income this month</span><strong>{formatCurrency(totals.income, currency)}</strong><small><ArrowUpRight size={13} /> Your recorded income</small></article>
        <article className="analytics-stat"><div className="analytics-stat-icon analytics-cyan"><TrendingDown size={18} /></div><span>Expenses this month</span><strong>{formatCurrency(totals.expenses, currency)}</strong><small className={totals.expenseChange === null ? '' : totals.expenseChange <= 0 ? 'analytics-good' : 'analytics-warning'}>{totals.expenseChange === null ? '—' : <>{totals.expenseChange <= 0 ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}{Math.abs(totals.expenseChange)}%</>} vs. last month</small></article>
        <article className="analytics-stat"><div className="analytics-stat-icon analytics-green"><PiggyBank size={18} /></div><span>Saved this month</span><strong>{formatCurrency(totals.saved, currency)}</strong><small><span className="savings-rate-mark">{savingsRate}%</span> savings rate</small></article>
      </section>

      <section className="panel analytics-trend-panel">
        <div className="panel-header">
          <div><h2>Income vs. expenses</h2><p>Monthly cash flow over the last six months</p></div>
          <div className="analytics-legend"><span><i className="legend-income" /> Income</span><span><i className="legend-expense" /> Expenses</span></div>
        </div>
        <div className="analytics-main-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 12, left: -14, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
                <linearGradient id="analyticsExpenses" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38bdf8" stopOpacity={0.16} /><stop offset="100%" stopColor="#38bdf8" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid stroke="#dbe4f1" vertical={false} strokeDasharray="3 5" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={12} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(value) => formatCompactCurrency(value, currency)} />
              <Tooltip content={<AnalyticsTooltip currency={currency} />} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#6c63ff" strokeWidth={2.7} fill="url(#analyticsIncome)" />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#38bdf8" strokeWidth={2.7} fill="url(#analyticsExpenses)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="analytics-detail-grid">
        <article className="panel category-analytics-panel">
          <div className="panel-header"><div><h2>Spending by category</h2><p>All recorded expenses</p></div><span className="analytics-total-chip">{formatCurrency(categoryTotal, currency)}</span></div>
          {categories.length ? (
            <div className="category-analytics-content">
              <div className="analytics-pie"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categories} dataKey="value" nameKey="name" innerRadius={62} outerRadius={83} paddingAngle={3} stroke="none">{categories.map((category) => <Cell key={category.name} fill={category.color} />)}</Pie><Tooltip formatter={(value) => formatCurrency(value, currency)} contentStyle={{ background: 'rgba(255,255,255,.96)', border: '1px solid rgba(148,163,184,.28)', borderRadius: 12, color: '#1e293b', boxShadow: '0 12px 30px rgba(30,41,59,.12)' }} /></PieChart></ResponsiveContainer></div>
              <div className="analytics-category-list">{categories.slice(0, 6).map((category) => <div className="analytics-category-row" key={category.name}><span className="analytics-category-name"><i style={{ backgroundColor: category.color }} />{category.name}</span><div className="analytics-category-meter"><i style={{ width: `${categoryTotal ? Math.max(4, category.value / categoryTotal * 100) : 0}%`, backgroundColor: category.color }} /></div><strong>{formatCurrency(category.value, currency)}</strong></div>)}</div>
            </div>
          ) : <div className="analytics-empty">Expenses by category will appear when you add transactions.</div>}
        </article>

        <article className="panel comparison-panel">
          <div className="panel-header"><div><h2>Monthly comparison</h2><p>Side-by-side cash flow</p></div><span className={`comparison-change ${totals.expenseChange === null ? '' : totals.expenseChange <= 0 ? 'analytics-good' : 'analytics-warning'}`}>{totals.expenseChange === null ? '—' : <>{totals.expenseChange <= 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}{Math.abs(totals.expenseChange)}%</>}</span></div>
          <div className="comparison-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyData.slice(-4)} barGap={5} margin={{ top: 10, right: 0, left: -18, bottom: 0 }}><CartesianGrid stroke="#dbe4f1" vertical={false} strokeDasharray="3 5" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={8} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(value) => formatCompactCurrency(value, currency)} /><Tooltip content={<AnalyticsTooltip currency={currency} />} /><Bar dataKey="income" name="Income" fill="#6c63ff" radius={[4, 4, 0, 0]} /><Bar dataKey="expenses" name="Expenses" fill="#38bdf8" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
          <div className="comparison-legend"><span><i className="legend-income" />Income</span><span><i className="legend-expense" />Expenses</span><span className="comparison-context">Compared with previous month</span></div>
        </article>
      </section>
    </div>
  );
}
