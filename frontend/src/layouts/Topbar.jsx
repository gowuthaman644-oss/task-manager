import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, Plus, Menu, X, AlertTriangle, Clock } from 'lucide-react';
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
  const navigate = useNavigate();
  const tasks = useSelector((s) => s.tasks.tasks);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const page = pageTitles[location.pathname] || { title: 'TaskFlow', subtitle: '' };

  const overdueTasks = tasks.filter((t) => {
    return t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date();
  });
  const overdueCount = overdueTasks.length;

  return (
    <header style={{
      height: '64px',
      background: 'var(--bg-secondary)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
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
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
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
          background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#94a3b8', transition: 'all 0.2s',
        }}>
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#94a3b8', position: 'relative', transition: 'all 0.2s',
            }}
          >
            <Bell size={16} />
            {overdueCount > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                width: '16px', height: '16px', borderRadius: '50%',
                background: '#ef4444', fontSize: '0.6rem', fontWeight: 700,
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {overdueCount > 9 ? '9+' : overdueCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifDropdown && (
            <div className="glass-card fade-in" style={{
              position: 'absolute', right: 0, top: '44px', width: '320px',
              padding: '1rem', zIndex: 100, boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem',
            }}
              onMouseLeave={() => setShowNotifDropdown(false)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Alerts & Notifications</span>
                <span style={{ fontSize: '0.68rem', color: '#ef4444', fontWeight: 600 }}>{overdueCount} Overdue</span>
              </div>

              {overdueTasks.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.78rem', padding: '1.5rem 0' }}>
                  🎉 No overdue tasks! You are all caught up.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {overdueTasks.slice(0, 5).map((task) => (
                    <div
                      key={task._id}
                      onClick={() => {
                        setShowNotifDropdown(false);
                        navigate('/tasks');
                      }}
                      style={{
                        padding: '0.6rem', borderRadius: '8px', cursor: 'pointer',
                        background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <AlertTriangle size={12} color="#ef4444" />
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.title}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.65rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} /> Overdue • {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {overdueTasks.length > 5 && (
                    <button
                      onClick={() => { setShowNotifDropdown(false); navigate('/tasks'); }}
                      style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', padding: '4px 0', textAlign: 'center' }}
                    >
                      View all overdue tasks
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

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
