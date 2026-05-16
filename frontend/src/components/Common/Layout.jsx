import { useState, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';

const SidebarContext = createContext(null);
export const useSidebar = () => useContext(SidebarContext);

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const closeSidebar  = () => setSidebarOpen(false);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar, closeSidebar }}>
      <div className="app">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="sidebar-overlay show" onClick={closeSidebar} />
        )}

        <Sidebar />

        <div className="main">
          <Topbar />
          <div className="content">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
