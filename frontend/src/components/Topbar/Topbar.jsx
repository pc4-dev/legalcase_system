import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useSidebar } from '../Common/Layout';
import { useAuth } from '../../context/AuthContext';
import NewCaseModal from '../Cases/NewCaseModal';

const PAGE_TITLES = {
  '/dashboard':     'Dashboard',
  '/cases':         'All Cases',
  '/lawyers':       'Lawyers',
  '/vault':         'Document Vault',
  '/notifications': 'Notifications',
};

export default function Topbar() {
  const location          = useLocation();
  const navigate          = useNavigate();
  const { toggleSidebar } = useSidebar();
  const { user }          = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const basePath = '/' + location.pathname.split('/')[1];
  const title    = PAGE_TITLES[basePath] || 'Legal Management';

  return (
    <>
      <header className="topbar">

        {/* ── Left: hamburger + title ── */}
        <div className="topbar-left">
          <button className="topbar-hamburger" onClick={toggleSidebar} aria-label="Toggle menu">
            <i className="ti ti-menu-2" />
          </button>

          <div className="topbar-title">
            <h1>{title}</h1>
            <div className="breadcrumb">
              <i className="ti ti-home" style={{ fontSize: 11 }} />
              <span>Neoteric Group</span>
              <i className="ti ti-chevron-right" style={{ fontSize: 10 }} />
              <span className="crumb-active">{title}</span>
            </div>
          </div>
        </div>

        {/* ── Right: actions + user chip ── */}
        <div className="topbar-right">

          {/* New Case button */}
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <i className="ti ti-plus" />
            <span className="btn-new-text">Create Case</span>
          </button>

          {/* Notifications bell */}
          <button
            className="notif-btn"
            onClick={() => navigate('/notifications')}
            title="Notifications"
          >
            <i className="ti ti-bell" />
            <span className="dot" />
          </button>

          {/* User chip — like Nexora */}
          <div className="topbar-user">
            <div className="tu-avatar">
              {user?.initials || 'RG'}
            </div>
            <div>
              <div className="tu-name">{user?.name?.split(' ')[0] || 'Rahul'}</div>
              <div className="tu-role">{user?.role === 'admin' ? 'Group CEO' : user?.role || 'Admin'}</div>
            </div>
          </div>
        </div>
      </header>

      <NewCaseModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <style>{`
        @media (max-width: 480px) {
          .btn-new-text { display: none; }
          .btn.btn-primary { padding: 8px 10px; }
        }
      `}</style>
    </>
  );
}
