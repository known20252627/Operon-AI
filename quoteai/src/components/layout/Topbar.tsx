'use client';
import { getGreeting, getDateString } from '@/lib/utils';
import { ActiveView } from '@/types';

interface TopbarProps {
  active: ActiveView;
  onNewQuote: () => void;
  onSearch: () => void;
  onToggleTheme: () => void;
  theme: string;
  notificationCount?: number;
  onNotifications?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function Topbar({ 
  active, 
  onNewQuote, 
  onSearch, 
  onToggleTheme, 
  theme, 
  notificationCount = 0, 
  onNotifications,
  isSidebarCollapsed = false,
  onToggleSidebar
}: TopbarProps) {
  return (
    <header className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar} 
            className="icon-button" 
            title={isSidebarCollapsed ? "Expand Sidebar (Cmd/Ctrl+B)" : "Collapse Sidebar (Cmd/Ctrl+B)"}
            style={{ fontSize: "17px" }}
          >
            {isSidebarCollapsed ? "☰" : "◫"}
          </button>
        )}
        <div>
          <p className="eyebrow">{getDateString()}</p>
          <h1>{active === "Overview" ? getGreeting() + ", Abhishek" : active}</h1>
        </div>
      </div>
      <div className="top-actions">
        <button className="icon-button" onClick={onSearch} title="Search (Cmd/Ctrl+K)">⌕</button>
        <button className="icon-button notification" onClick={onNotifications} title="Notifications">
          ♧{notificationCount > 0 && <span />}
        </button>
        <button className="icon-button" onClick={onToggleTheme} title="Toggle Theme">
          {theme === 'dark' ? '☽' : '☀'}
        </button>
        <button className="new-quote" onClick={onNewQuote}>＋ New quotation</button>
      </div>
    </header>
  );
}
