import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../Common/Layout';
import { notificationService } from '../../services/notificationService';

const ENTITIES = [
  { name: 'Neoteric Properties', icon: 'ti-building' },
  { name: 'Navayan Realty',      icon: 'ti-building-skyscraper' },
  { name: 'Heaven Heights',      icon: 'ti-building-community' },
];

export default function Sidebar() {
  const { user, logout }             = useAuth();
  const { sidebarOpen, closeSidebar } = useSidebar();
  const navigate                     = useNavigate();
  const [unread, setUnread]           = useState(0);

  useEffect(() => {
    notificationService.getAll({ isRead: false })
      .then((d) => setUnread(d.unreadCount || 0))
      .catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>

      {/* ── Brand / Logo ── */}
      <div className="sidebar-logo">
        <div className="brand-icon">
          <i className="ti ti-gavel" />
        </div>
        <div className="brand-text">
          <div className="brand-name">Neoteric Group</div>
          <div className="brand-sub">Legal Portal</div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="sidebar-nav">

        <div className="nav-section-label">Overview</div>

        <NavLink
          to="/dashboard"
          onClick={closeSidebar}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <i className="ti ti-layout-dashboard" />
          Dashboard
        </NavLink>

        <NavLink
          to="/cases"
          onClick={closeSidebar}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <i className="ti ti-briefcase" />
          All Cases
          <span className="nav-badge">14</span>
        </NavLink>

        <div className="nav-section-label">Manage</div>

        <NavLink
          to="/lawyers"
          onClick={closeSidebar}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <i className="ti ti-user-check" />
          Lawyers
        </NavLink>

        <NavLink
          to="/vault"
          onClick={closeSidebar}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <i className="ti ti-folder" />
          Document Vault
        </NavLink>

        <div className="nav-section-label">Alerts</div>

        <NavLink
          to="/notifications"
          onClick={closeSidebar}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <i className="ti ti-bell" />
          Notifications
          {unread > 0 && <span className="nav-badge red">{unread}</span>}
        </NavLink>

        <div className="nav-section-label">Entities</div>

        {ENTITIES.map((e) => (
          <div key={e.name} className="nav-item entity">
            <i className={`ti ${e.icon}`} />
            {e.name}
          </div>
        ))}
      </nav>

      {/* ── Footer / User ── */}
      <div className="sidebar-footer">
        <div className="user-avatar">
          {user?.initials || 'RG'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
