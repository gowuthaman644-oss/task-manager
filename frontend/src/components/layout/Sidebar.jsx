import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSelector } from 'react-redux';
import {
  CheckSquare, LayoutDashboard, ListTodo, BarChart2,
  Settings, LogOut, ChevronLeft, ChevronRight, User,
  Zap, Calendar, Target
} from 'lucide-react';
import { getInitials } from '../../utils/helpers';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tasks', icon: ListTodo, label: 'My Tasks' },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/profile', icon: Settings, label: 'Settings' },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const stats = useSelector((s) => s.tasks.stats);

  return (
    <aside style={{
      width: collapsed ? '72px' : '240px',
      minHeight: '100vh',
      background: 'rgba(22, 33, 62, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      flexShrink: 0,
      zIndex: 10,
    }}>
      {/* Header */}
      <div style={{
        padding: collapsed ? '1.25rem 0' : '1.25rem 1rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: '38px', height: '38px', flexShrink: 0,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(99,102,241,0.3)'
        }}>
          <CheckSquare size={20} color="white" />
        </div>
        {!collapsed && (
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Plus Jakarta Sans', whiteSpace: 'nowrap' }}>
            TaskFlow
          </span>
        )}
      </div>

      {/* Toggle button */}
      <button onClick={() => setCollapsed(!collapsed)} style={{
        position: 'absolute', top: '1.2rem', right: '-14px',
        width: '28px', height: '28px', borderRadius: '50%',
        background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#94a3b8', transition: 'all 0.2s', zIndex: 20,
      }}>
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Quick stats */}
      {!collapsed && stats && (
        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Total', value: stats.total || 0, color: '#818cf8', icon: Target },
              { label: 'Done', value: stats.byStatus?.completed || 0, color: '#10b981', icon: Zap },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
                padding: '8px 10px', border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <p style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>{label}</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, color }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ padding: '0.75rem 0', flex: 1 }}>
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink key={path} to={path} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center',
            gap: '12px', padding: collapsed ? '0.75rem 0' : '0.75rem 1rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
            margin: '2px 8px', borderRadius: '10px',
            textDecoration: 'none', transition: 'all 0.2s',
            background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
            color: isActive ? '#818cf8' : '#64748b',
            borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
          })}>
            <Icon size={20} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {!collapsed && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '0.75rem', borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)', marginBottom: '8px'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0
            }}>
              {getInitials(user?.name)}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </p>
              <p style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </p>
            </div>
          </div>
        )}
        <button onClick={logout} style={{
          width: '100%', display: 'flex', alignItems: 'center',
          gap: '10px', justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0.75rem 0' : '0.75rem 1rem',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: '10px', cursor: 'pointer', color: '#ef4444',
          fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s',
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
        >
          <LogOut size={18} />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
