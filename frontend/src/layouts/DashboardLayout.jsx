import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import TaskModal from '../components/tasks/TaskModal';
import { SocketProvider } from '../context/SocketContext';

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Theme variable toggler
  useEffect(() => {
    if (darkMode) {
      document.documentElement.style.setProperty('--bg-primary', '#0f0f1a');
      document.documentElement.style.setProperty('--bg-secondary', '#1a1a2e');
      document.documentElement.style.setProperty('--bg-card', '#16213e');
      document.documentElement.style.setProperty('--bg-glass', 'rgba(255, 255, 255, 0.04)');
      document.documentElement.style.setProperty('--border', 'rgba(255, 255, 255, 0.08)');
      document.documentElement.style.setProperty('--text-primary', '#f1f5f9');
      document.documentElement.style.setProperty('--text-secondary', '#94a3b8');
      document.documentElement.style.setProperty('--text-muted', '#64748b');
    } else {
      document.documentElement.style.setProperty('--bg-primary', '#f8fafc');
      document.documentElement.style.setProperty('--bg-secondary', '#ffffff');
      document.documentElement.style.setProperty('--bg-card', '#ffffff');
      document.documentElement.style.setProperty('--bg-glass', 'rgba(255, 255, 255, 0.7)');
      document.documentElement.style.setProperty('--border', 'rgba(15, 23, 42, 0.08)');
      document.documentElement.style.setProperty('--text-primary', '#0f172a');
      document.documentElement.style.setProperty('--text-secondary', '#475569');
      document.documentElement.style.setProperty('--text-muted', '#94a3b8');
    }
  }, [darkMode]);

  return (
    <SocketProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)', zIndex: 15,
            }}
          />
        )}

        {/* Sidebar */}
        <div style={{
          position: window.innerWidth <= 768 ? 'fixed' : 'relative',
          left: window.innerWidth <= 768 ? (mobileMenuOpen ? '0' : '-280px') : '0',
          top: 0, height: '100vh', zIndex: 20,
          transition: 'left 0.3s ease',
        }}>
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <Topbar
            darkMode={darkMode}
            toggleDarkMode={() => setDarkMode(!darkMode)}
            onAddTask={() => setShowTaskModal(true)}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
          <main style={{
            flex: 1, overflowY: 'auto',
            padding: '1.5rem',
            background: 'radial-gradient(ellipse at top right, rgba(99,102,241,0.05) 0%, transparent 60%), var(--bg-primary)',
          }}>
            <Outlet context={{ openTaskModal: () => setShowTaskModal(true) }} />
          </main>
        </div>

        {/* Task Modal */}
        {showTaskModal && (
          <TaskModal
            onClose={() => setShowTaskModal(false)}
            mode="create"
          />
        )}
      </div>
    </SocketProvider>
  );
};

export default DashboardLayout;
