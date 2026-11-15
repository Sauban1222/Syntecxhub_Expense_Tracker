import { ArrowDownRight, ArrowUpRight, CircleHelp } from 'lucide-react';

export default function StatCard({ title, amount, change, changeLabel, tone, icon: Icon, detail }) {
  const comparable = Number.isFinite(change);
  const positive = comparable && change >= 0;
  return (
    <article className={`stat-card stat-card-${tone}`}>
      <div className="stat-topline">
        <div className="stat-icon"><Icon size={18} strokeWidth={1.9} /></div>
        <span className="stat-help" title={detail} aria-hidden="true"><CircleHelp size={15} /></span>
      </div>
      <p className="stat-title">{title}</p>
      <div className="stat-amount">{amount}</div>
      <div className="stat-foot">
        <span className={`change-pill ${!comparable ? 'change-unavailable' : positive ? 'change-positive' : 'change-negative'}`}>
          {comparable && (positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />)}
          {comparable ? `${Math.abs(change)}%` : '—'}
        </span>
        <span className="stat-comparison">{changeLabel}</span>
      </div>
    </article>
  );
}
