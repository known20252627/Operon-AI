'use client';
import { NAV_ITEMS } from '@/lib/constants';
import { ActiveView } from '@/types';

interface SidebarProps {
  active: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onSettings: () => void;
  onToggleCopilot?: () => void;
}

export function Sidebar({ active, onNavigate, onSettings, onToggleCopilot }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">O</span>
        <span>operon<span>ai</span></span>
      </div>
      <div className="company-switch">
        <span className="company-icon">O</span>
        <span><b>Operon AI Officer</b><small>Medline Workspace</small></span>
        <span className="chevron">⌄</span>
      </div>
      <nav>
        {NAV_ITEMS.map(({name, icon, badge}) => (
          <button 
            key={name} 
            className={active === name ? "nav-item active" : "nav-item"} 
            onClick={() => onNavigate(name as ActiveView)}
          >
            <i>{icon}</i>{name}{badge && <em>{badge}</em>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        {onToggleCopilot && (
          <button className="nav-item" onClick={onToggleCopilot}>
            <i>⚡</i>AI Copilot
          </button>
        )}
        <button className="nav-item" onClick={onSettings}>
          <i>⚙</i>Settings
        </button>
        <button className="profile">
          <span>PS</span>
          <b>Pratik Shah<small>Admin</small></b>
          <i>⋮</i>
        </button>
      </div>
    </aside>
  );
}
