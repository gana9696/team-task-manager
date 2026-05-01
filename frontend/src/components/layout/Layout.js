import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'member'] },
  { path: '/projects', label: 'Projects', icon: '📁', roles: ['admin', 'member'] },
  { path: '/tasks', label: 'All Tasks', icon: '✅', roles: ['admin'] },
  { path: '/my-tasks', label: 'My Tasks', icon: '📋', roles: ['member'] },
  { path: '/admin', label: 'Admin Panel', icon: '⚙️', roles: ['admin'] },
];

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filtered = navItems.filter(n => n.roles.includes(user?.role));

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0,
        height: '100vh', zIndex: 200, transition: 'left 0.3s'
      }}
        className={`sidebar${sidebarOpen ? ' open' : ''}`}
      >
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 20, color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>⚡ TeamTask</h2>
        </div>

        <nav style={{ flex: 1, padding: '12px 0' }}>
          {filtered.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 20px', fontSize: 14, fontWeight: 500,
                color: location.pathname === item.path ? 'var(--accent)' : 'var(--text2)',
                background: location.pathname === item.path ? 'rgba(108,99,255,0.1)' : 'transparent',
                borderLeft: location.pathname === item.path ? '3px solid var(--accent)' : '3px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--accent)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 700, fontSize: 16
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
              <span className={`badge badge-${user?.role}`}>{user?.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }} />
      )}

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 240, padding: '24px', minHeight: '100vh' }} className="main-content">
        {/* Mobile header */}
        <div className="mobile-header" style={{ display: 'none', marginBottom: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setSidebarOpen(true)} className="btn btn-ghost btn-sm">☰</button>
          <h2 style={{ fontSize: 18, color: 'var(--accent)' }}>⚡ TeamTask</h2>
        </div>
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { left: -240px !important; }
          .sidebar.open { left: 0 !important; }
          .main-content { margin-left: 0 !important; }
          .mobile-header { display: flex !important; }
        }
      `}</style>
    </div>
  );
}