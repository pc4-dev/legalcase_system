import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../Common/Layout';
import { notificationService } from '../../services/notificationService';

export default function Sidebar() {
  const { user, logout }              = useAuth();
  const { sidebarOpen, closeSidebar } = useSidebar();
  const navigate                      = useNavigate();
  const [unread, setUnread]           = useState(0);

  useEffect(() => {
    notificationService.getAll({ isRead: false })
      .then((d) => setUnread(d.unreadCount || 0))
      .catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItem = (to, icon, label, badge) => (
    <NavLink to={to} onClick={closeSidebar}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
      <i className={`ti ${icon}`} />
      {label}
      {badge > 0 && <span className={`nav-badge${label === 'Notifications' ? ' red' : ''}`}>{badge}</span>}
    </NavLink>
  );

  return (
    <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>

      {/* Brand */}
      <div className="sidebar-logo">
        <div className="brand-icon"><i className="ti ti-gavel" /></div>
        <div className="brand-text">
          <div className="brand-name">Neoteric Group</div>
          <div className="brand-sub">Legal Portal</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Overview</div>
        {navItem('/dashboard', 'ti-layout-dashboard', 'Dashboard')}
        {navItem('/cases',     'ti-briefcase',        'All Cases', 0)}
        {navItem('/calendar',  'ti-calendar-event',   'Hearing Calendar')}

        <div className="nav-section-label">Manage</div>
        {navItem('/lawyers',   'ti-user-check', 'Lawyers')}
        {navItem('/entities',  'ti-building',   'Entities')}
        {navItem('/vault',     'ti-folder',     'Document Vault')}

        <div className="nav-section-label">Alerts</div>
        {navItem('/notifications', 'ti-bell', 'Notifications', unread)}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-avatar">{user?.initials || 'RG'}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="user-name" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {user?.name || 'Rahul Gupta'}
          </div>
          <div className="user-role">
            {user?.role === 'admin' ? 'Group CEO' : user?.role || 'Admin'}
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Sign out">
          <i className="ti ti-logout" />
        </button>
      </div>
    </aside>
  );
}
