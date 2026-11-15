import { useEffect, useRef, useState } from 'react';
import { Bell, Menu, Plus, Search } from 'lucide-react';

export default function Topbar({
  onAdd,
  onMenu,
  onSearch,
  searchQuery,
  activePage,
  onNavigate,
  userName = 'Jordan Davis',
  userInitials = 'JD',
}) {
  const searchInputRef = useRef(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const shortcutLabel = navigator.platform?.toLowerCase().includes('mac') ? '⌘ K' : 'Ctrl K';
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  useEffect(() => {
    function handleSearchShortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleSearchShortcut);
    return () => document.removeEventListener('keydown', handleSearchShortcut);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-heading">
        <button className="icon-button mobile-menu" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button>
        <div>
          <div className="breadcrumb">Workspace <span>/</span> <strong>{activePage}</strong></div>
          <p className="topbar-date">{dateLabel}</p>
        </div>
      </div>
      <div className="topbar-actions">
        <label className="search-field">
          <Search size={17} />
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search transactions..."
            aria-label="Search transactions"
            value={searchQuery}
            onFocus={() => activePage !== 'transactions' && onNavigate('transactions')}
            onChange={(event) => {
              onSearch(event.target.value);
              if (activePage !== 'transactions') onNavigate('transactions');
            }}
          />
          <kbd>{shortcutLabel}</kbd>
        </label>
        <div className="notifications-wrap">
          <button
            className="icon-button notification-button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            aria-controls="notifications-panel"
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <Bell size={18} />
          </button>
          {notificationsOpen && (
            <div className="notification-panel" id="notifications-panel" role="status">
              <strong>You’re all caught up</strong>
              <span>There are no new notifications.</span>
            </div>
          )}
        </div>
        <div className="topbar-avatar" title={userName} aria-label={`${userName} profile`}>{userInitials}</div>
        <span className="period-button" aria-label="Selected period: this month">
          <span className="period-dot" /> This month
        </span>
        <button className="button button-primary topbar-add" onClick={onAdd}>
          <Plus size={17} strokeWidth={2.4} /><span>Add transaction</span>
        </button>
      </div>
    </header>
  );
}
