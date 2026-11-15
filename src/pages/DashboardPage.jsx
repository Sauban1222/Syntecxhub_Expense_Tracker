import { useMemo } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowUpRight as UpRight,
  CreditCard,
  Download,
  Ellipsis,
  Plus,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import StatCard from '../components/StatCard.jsx';
import TransactionTable from '../components/TransactionTable.jsx';
import {
  createMonthlyOverview,
  formatCompactCurrency,
  formatCurrency,
  getCategoryExpenses,
  getCurrentDate,
  getMonthKey,
  getPercentageChange,
} from '../utils/finance.js';
import { exportTransactions } from '../utils/exportTransactions.js';

function ChartTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      {payload.map((item) => (
        <div key={item.dataKey} className="tooltip-line">
          <span style={{ backgroundColor: item.color }} />{item.name}
          <b>{formatCurrency(item.value, currency)}</b>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage({
  transactions,
  loading,
  stats,
  storageMode,
  currency = 'USD',
  greeting = 'Good morning, friend',
  onAdd,
  onNavigate,
}) {
  const chartData = useMemo(() => createMonthlyOverview(transactions), [transactions]);
  const currentMonthTransactions = useMemo(
    () => transactions.filter((item) => getMonthKey(item.date) === getMonthKey(getCurrentDate())),
    [transactions],
  );
  const categoryData = useMemo(() => getCategoryExpenses(currentMonthTransactions), [currentMonthTransactions]);
  const monthIncome = currentMonthTransactions.reduce(
    (total, item) => total + (item.type === 'income' ? Number(item.amount) : 0),
    0,
  );
  const monthExpenses = currentMonthTransactions.reduce(
    (total, item) => total + (item.type === 'expense' ? Number(item.amount) : 0),
    0,
  );
  const savingsRate = monthIncome > 0 ? Math.round(((monthIncome - monthExpenses) / monthIncome) * 100) : 0;
  const previousBalance = stats.balance - monthIncome + monthExpenses;
  const balanceChange = getPercentageChange(stats.balance, previousBalance);
  const recentTransactions = useMemo(
    () => [...transactions].sort((a, b) => new Date(`${b.date}T00:00:00`) - new Date(`${a.date}T00:00:00`)).slice(0, 5),
    [transactions],
  );
  const latestMonth = chartData[chartData.length - 1];
  const previousMonth = chartData[chartData.length - 2];
  const expenseChange = getPercentageChange(latestMonth?.expenses, previousMonth?.expenses);
  const incomeChange = getPercentageChange(latestMonth?.income, previousMonth?.income);

  return (
    <div className="page-content dashboard-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR FINANCIAL SNAPSHOT</div>
          <h1>{greeting} <span className="heading-wave">✳</span></h1>
          <p>Here’s what’s happening with your money today.</p>
        </div>
        <div className="heading-actions">
          <button className="button button-outline" onClick={() => exportTransactions(transactions)}><Download size={16} /> Export report</button>
          <button className="button button-primary" onClick={onAdd}><Plus size={17} /> Add transaction</button>
        </div>
      </div>

      <section className="stats-grid" aria-label="Financial summary">
        <StatCard title="Total balance" amount={formatCurrency(stats.balance, currency)} change={balanceChange} changeLabel="vs. last month" tone="violet" icon={Wallet} detail="Income minus expenses across your transactions." />
        <StatCard title="Total income" amount={formatCurrency(monthIncome, currency)} change={incomeChange} changeLabel="vs. last month" tone="green" icon={ArrowUpRight} detail="Income received this month." />
        <StatCard title="Total expenses" amount={formatCurrency(monthExpenses, currency)} change={expenseChange === null ? null : -expenseChange} changeLabel="vs. last month" tone="orange" icon={CreditCard} detail="Expenses recorded this month." />
        <StatCard title="Monthly savings" amount={formatCurrency(monthIncome - monthExpenses, currency)} change={savingsRate} changeLabel="savings rate" tone="blue" icon={TrendingUp} detail="Income minus expenses this month." />
      </section>

      <section className="dashboard-insights">
        <article className="panel overview-panel">
          <div className="panel-header">
            <div>
              <div className="panel-heading-row"><h2>Financial overview</h2><button className="icon-button panel-more" aria-label="Overview details" onClick={() => onNavigate('analytics')}><Ellipsis size={19} /></button></div>
              <p>Your income and expenses over time</p>
            </div>
            <div className="chart-period"><span className="period-dot" /> Last 6 months</div>
          </div>
          <div className="chart-legend">
            <span><i className="legend-income" /> Income <strong>{formatCurrency(monthIncome, currency)}</strong></span>
            <span><i className="legend-expense" /> Expenses <strong>{formatCurrency(monthExpenses, currency)}</strong></span>
            <span className={`legend-trend ${expenseChange === null ? '' : expenseChange <= 0 ? 'trend-good' : 'trend-warn'}`}>{expenseChange === null ? '—' : <>{expenseChange <= 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}{Math.abs(expenseChange)}%</>} <small>vs last month</small></span>
          </div>
          <div className="overview-chart">
            {loading ? <div className="chart-loading"><span className="loading-spinner" />Preparing your overview...</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 4, left: -17, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.28} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
                    <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38bdf8" stopOpacity={0.17} /><stop offset="95%" stopColor="#38bdf8" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid stroke="#dbe4f1" vertical={false} strokeDasharray="3 5" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(value) => formatCompactCurrency(value, currency)} />
                  <Tooltip content={<ChartTooltip currency={currency} />} />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#6c63ff" strokeWidth={2.5} fill="url(#incomeFill)" activeDot={{ r: 5, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#38bdf8" strokeWidth={2.5} fill="url(#expenseFill)" activeDot={{ r: 5, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="panel category-panel">
          <div className="panel-header">
            <div><h2>Spending breakdown</h2><p>Where your money goes</p></div>
            <button className="icon-button panel-more" aria-label="See analytics" onClick={() => onNavigate('analytics')}><UpRight size={17} /></button>
          </div>
          {categoryData.length ? (
            <>
              <div className="donut-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={66} outerRadius={88} paddingAngle={4} stroke="none">
                      {categoryData.map((item) => <Cell key={item.name} fill={item.color} />)}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value, currency)} contentStyle={{ background: 'rgba(255,255,255,.96)', border: '1px solid rgba(148,163,184,.28)', borderRadius: 12, color: '#1e293b', boxShadow: '0 12px 30px rgba(30,41,59,.12)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center"><span>This month</span><strong>{formatCompactCurrency(monthExpenses, currency)}</strong><small>total spent</small></div>
              </div>
              <div className="category-legend">
                {categoryData.slice(0, 4).map((category) => {
                  const percentage = monthExpenses > 0 ? Math.round((category.value / monthExpenses) * 100) : 0;
                  return <div className="category-legend-row" key={category.name}><span><i style={{ background: category.color }} />{category.name}</span><strong>{percentage}%</strong></div>;
                })}
              </div>
            </>
          ) : (
            <div className="chart-empty"><div className="empty-icon"><CreditCard size={21} /></div><strong>No spending to show</strong><span>Add an expense to see your breakdown.</span><button className="text-button" onClick={onAdd}>Add expense <Plus size={14} /></button></div>
          )}
        </article>
      </section>

      <section className="bottom-grid">
        <article className="panel recent-panel">
          <div className="panel-header recent-header">
            <div><h2>Recent transactions</h2><p>Your latest money movements</p></div>
            <button className="text-button" onClick={() => onNavigate('transactions')}>View all <UpRight size={15} /></button>
          </div>
          <TransactionTable transactions={recentTransactions} compact loading={loading} currency={currency} onViewAll={() => onNavigate('transactions')} />
        </article>

        <article className="savings-card">
          <div className="savings-card-top">
            <div className="savings-icon"><Sparkles size={19} /></div>
            <span className="savings-badge">MONTHLY INSIGHT</span>
            <button className="icon-button panel-more" aria-label="Monthly insight details" onClick={() => onNavigate('analytics')}><Ellipsis size={19} /></button>
          </div>
          <h2>You’re building<br />great habits.</h2>
          <p>{monthIncome > 0 && savingsRate < 0
            ? `This month’s expenses are ${Math.abs(savingsRate)}% higher than your recorded income. Review your spending to keep your finances on track.`
            : savingsRate > 0
              ? `You saved ${savingsRate}% of this month’s income. Keep up the momentum — consistency is what gets you to your goals.`
              : 'Track your income and spending to see your saving habits take shape over time.'}</p>
          <div className="savings-meter">
            <div className="meter-label"><span>Monthly savings rate</span><strong>{savingsRate}%</strong></div>
            <div className="meter-track"><span style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }} /></div>
          </div>
          <button className="savings-link" onClick={() => onNavigate('analytics')}>Explore your insights <UpRight size={15} /></button>
          <span className="savings-decoration" />
        </article>
      </section>

      <div className="dashboard-footnote">
        <span>
          <span className={`live-dot ${storageMode === 'local' ? 'offline-dot' : ''}`} />
          {loading ? 'Loading your account' : storageMode === 'supabase' ? 'Secure account storage' : storageMode === 'local' ? 'Saved in this browser' : 'Mock API connected'}
        </span>
        <span>{loading ? 'Syncing transactions' : storageMode === 'supabase' ? 'Synced with Supabase' : storageMode === 'local' ? 'API unavailable' : 'Synced just now'}</span>
      </div>
    </div>
  );
}
