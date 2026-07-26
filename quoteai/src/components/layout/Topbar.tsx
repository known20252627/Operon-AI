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
}

export function Topbar({ 
  active, 
  onNewQuote, 
  onSearch, 
  onToggleTheme, 
  theme, 
  notificationCount = 0, 
  onNotifications 
}: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{getDateString()}</p>
        <h1>{active === "Overview" ? getGreeting() + ", Pratik" : active}</h1>
      </div>
      <div className="top-actions">
        <button className="icon-button" onClick={onSearch}>⌕</button>
        <button className="icon-button notification" onClick={onNotifications}>
          ♧{notificationCount > 0 && <span />}
        </button>
        <button className="icon-button" onClick={onToggleTheme}>
          {theme === 'dark' ? '☽' : '☀'}
        </button>
        <button className="new-quote" onClick={onNewQuote}>＋ New quotation</button>
      </div>
    </header>
  );
}
