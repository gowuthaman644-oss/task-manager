import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import TaskModal from '../tasks/TaskModal';
import { SocketProvider } from '../../contexts/SocketContext';

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
