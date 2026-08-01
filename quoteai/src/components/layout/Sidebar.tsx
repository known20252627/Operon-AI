'use client';
import { NAV_ITEMS } from '@/lib/constants';
import { ActiveView } from '@/types';

interface SidebarProps {
  active: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onSettings: () => void;
  collapsed?: boolean;
}

export function Sidebar({ active, onNavigate, onSettings, collapsed = false }: SidebarProps) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="brand">
        <span className="brand-mark" title="Operon AI">O</span>
        {!collapsed && <span>operon<span>ai</span></span>}
      </div>
      <div className="company-switch" title="Operon AI Officer · Medline Workspace">
        <span className="company-icon">O</span>
        {!collapsed && (
          <>
            <span><b>Operon AI Officer</b><small>Medline Workspace</small></span>
            <span className="chevron">⌄</span>
          </>
        )}
      </div>
      <nav>
        {NAV_ITEMS.map(({name, icon, badge}) => (
          <button 
            key={name} 
            className={active === name ? "nav-item active" : "nav-item"} 
            onClick={() => onNavigate(name as ActiveView)}
            title={collapsed ? `${name}${badge ? ` (${badge})` : ""}` : undefined}
          >
            <i>{icon}</i>
            {!collapsed && name}
            {!collapsed && badge && <em>{badge}</em>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button 
          className="nav-item" 
          onClick={onSettings}
          title={collapsed ? "Settings" : undefined}
        >
          <i>⚙</i>
          {!collapsed && "Settings"}
        </button>
        <button 
          className="profile"
          title={collapsed ? "Abhishek Jha (Admin)" : undefined}
        >
          <span>AJ</span>
          {!collapsed && (
            <>
              <b>Abhishek Jha<small>Admin</small></b>
              <i>⋮</i>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

