import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Sun, Moon, Plus, Menu, X } from 'lucide-react';
import { useSelector } from 'react-redux';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your tasks and productivity' },
  '/tasks': { title: 'My Tasks', subtitle: 'Manage and track all your tasks' },
  '/analytics': { title: 'Analytics', subtitle: 'Insights into your productivity' },
  '/calendar': { title: 'Calendar', subtitle: 'View tasks by date' },
  '/profile': { title: 'Settings', subtitle: 'Manage your account' },
};

const Topbar = ({ darkMode, toggleDarkMode, onAddTask, mobileMenuOpen, setMobileMenuOpen }) => {
  const location = useLocation();
  const stats = useSelector((s) => s.tasks.stats);
  const page = pageTitles[location.pathname] || { title: 'TaskFlow', subtitle: '' };
  const overdue = stats?.overdue || 0;

  return (
    <header style={{
      height: '64px',
      background: 'rgba(15, 15, 26, 0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      gap: '1rem',
      position: 'sticky',
      top: 0,
      zIndex: 9,
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none', background: 'none', border: 'none', cursor: 'pointer',
            color: '#94a3b8', padding: '4px',
          }}
          className="mobile-menu-btn"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>
            {page.title}
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{page.subtitle}</p>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Dark mode toggle */}
        <button onClick={toggleDarkMode} style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#94a3b8', transition: 'all 0.2s',
        }}>
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#94a3b8', position: 'relative', transition: 'all 0.2s',
        }}>
          <Bell size={16} />
          {overdue > 0 && (
            <span style={{
              position: 'absolute', top: '-4px', right: '-4px',
              width: '16px', height: '16px', borderRadius: '50%',
              background: '#ef4444', fontSize: '0.6rem', fontWeight: 700,
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {overdue > 9 ? '9+' : overdue}
            </span>
          )}
        </button>

        {/* Add Task */}
        <button onClick={onAddTask} className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <Plus size={16} />
          <span className="hide-mobile">New Task</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
