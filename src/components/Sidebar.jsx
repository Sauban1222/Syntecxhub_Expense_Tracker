import {
  ArrowRight,
  BarChart3,
  LayoutDashboard,
  LogOut,
  Settings,
  Tag,
  WalletCards,
  X,
} from 'lucide-react';

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: WalletCards },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({
  activePage,
  onNavigate,
  isOpen,
  onClose,
  userName = 'Jordan Davis',
  userEmail = '',
  userInitials = 'JD',
  isAuthenticated = false,
  onSignOut,
}) {
  return (
    <>
      {isOpen && <button className="sidebar-backdrop" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><WalletCards size={21} strokeWidth={2.2} /></div>
          <div className="brand-copy">
            <span className="brand-name">spendly<span>.</span></span>
            <span className="brand-tagline">Smart Money. Better Decisions.</span>
          </div>
          <button className="icon-button mobile-close" onClick={onClose} aria-label="Close menu"><X size={19} /></button>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-avatar">{userInitials.slice(0, 1)}</div>
          <div className="workspace-copy"><strong>{userName.split(' ')[0]}’s space</strong><span>{isAuthenticated ? 'Secure account' : 'Local demo workspace'}</span></div>
        </div>

        <div className="nav-section-label">MENU</div>
        <nav className="main-navigation" aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              className={`nav-link ${activePage === id ? 'nav-link-active' : ''}`}
              key={id}
              onClick={() => { onNavigate(id); onClose(); }}
              aria-current={activePage === id ? 'page' : undefined}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {id === 'transactions' && <span className="nav-count">↗</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-glow" />
            <p className="tip-eyebrow">YOUR MONEY, IN FOCUS</p>
            <p className="tip-title">Every detail counts.</p>
            <p className="tip-copy">Review your transactions to stay in the loop.</p>
            <button className="tip-link" onClick={() => { onNavigate('transactions'); onClose(); }}>
              Review transactions <ArrowRight size={13} />
            </button>
          </div>
          <div className="profile-row">
            <div className="profile-avatar">{userInitials}</div>
            <div className="profile-copy"><strong>{userName}</strong><span>{userEmail || (isAuthenticated ? 'Personal account' : 'Demo profile')}</span></div>
            <button className="profile-logout" type="button" aria-label={isAuthenticated ? 'Sign out' : 'Exit demo'} title={isAuthenticated ? 'Sign out' : 'Exit demo'} onClick={onSignOut}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
