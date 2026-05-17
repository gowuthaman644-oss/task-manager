import { useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import {
  CheckCircle2, Clock, AlertTriangle, Target,
  TrendingUp, Zap, Calendar, BarChart2, ArrowRight, Plus
} from 'lucide-react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import TaskCard from '../components/tasks/TaskCard';

const StatCard = ({ icon: Icon, label, value, sub, color, gradient, onClick }) => (
  <div
    className="glass-card"
    onClick={onClick}
    style={{
      padding: '1.25rem',
      position: 'relative',
      overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s',
    }}
    onMouseEnter={(e) => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.15)';
      }
    }}
    onMouseLeave={(e) => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }
    }}
  >
    <div style={{
      position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px',
      borderRadius: '50%', background: `${color}15`,
    }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, marginBottom: '0.4rem' }}>{label}</p>
        <p style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>{sub}</p>}
      </div>
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        background: gradient || `${color}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={22} color={color} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { tasks, stats, loading, statsLoading, loadTasks, loadStats, filters, updateFilters } = useTasks();
  const context = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
    loadStats();
  }, [filters]);

  const recentTasks = tasks.slice(0, 4);
  const completionRate = stats?.completionRate || 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleStatsClick = (statusFilter = '') => {
    updateFilters({ status: statusFilter, priority: '', category: '', search: '' });
    navigate('/tasks');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome banner */}
      <div className="glass-card" style={{
        padding: '1.5rem 2rem',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 50%, rgba(6,182,212,0.08) 100%)',
        borderColor: 'rgba(99,102,241,0.2)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(99,102,241,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '100px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(139,92,246,0.06)' }} />
        <div style={{ position: 'relative' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Plus Jakarta Sans' }}>
            {greeting()}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '0.4rem', fontSize: '0.9rem' }}>
            {stats?.total
              ? `You have ${stats?.byStatus?.todo || 0} pending tasks${stats?.overdue ? ` and ${stats.overdue} overdue` : ''}. Keep it up!`
              : 'Start by creating your first task!'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <button onClick={() => context?.openTaskModal()} className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '0.6rem 1.25rem' }}>
              <Plus size={15} /> New Task
            </button>
            <Link to="/tasks">
              <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '0.6rem 1.25rem' }}>
                View All Tasks <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatCard icon={Target} label="Total Tasks" value={statsLoading ? '—' : (stats?.total || 0)} sub="All time" color="#818cf8" onClick={() => handleStatsClick('')} />
        <StatCard icon={CheckCircle2} label="Completed" value={statsLoading ? '—' : (stats?.byStatus?.completed || 0)} sub={`${completionRate}% completion rate`} color="#10b981" onClick={() => handleStatsClick('completed')} />
        <StatCard icon={Clock} label="In Progress" value={statsLoading ? '—' : (stats?.byStatus?.['in-progress'] || 0)} sub="Currently active" color="#06b6d4" onClick={() => handleStatsClick('in-progress')} />
        <StatCard icon={AlertTriangle} label="Overdue" value={statsLoading ? '—' : (stats?.overdue || 0)} sub="Need attention" color="#ef4444" onClick={() => handleStatsClick('todo')} />
        <StatCard icon={Calendar} label="Due Today" value={statsLoading ? '—' : (stats?.dueToday || 0)} sub="Scheduled for today" color="#f59e0b" onClick={() => navigate('/calendar')} />
        <StatCard icon={Zap} label="Done This Week" value={statsLoading ? '—' : (stats?.completedThisWeek || 0)} sub="Last 7 days" color="#a78bfa" onClick={() => handleStatsClick('completed')} />
      </div>

      {/* Completion progress */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#818cf8" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9' }}>Overall Progress</h3>
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818cf8' }}>{completionRate}%</span>
        </div>
        <div className="progress-bar" style={{ height: '10px' }}>
          <div className="progress-fill" style={{ width: `${completionRate}%`, transition: 'width 1s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
          {[
            { label: 'To Do', value: stats?.byStatus?.todo || 0, color: '#94a3b8' },
            { label: 'In Progress', value: stats?.byStatus?.['in-progress'] || 0, color: '#06b6d4' },
            { label: 'Completed', value: stats?.byStatus?.completed || 0, color: '#10b981' },
            { label: 'Cancelled', value: stats?.byStatus?.cancelled || 0, color: '#64748b' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 700, color }}>{value}</p>
              <p style={{ fontSize: '0.7rem', color: '#64748b' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Priority breakdown */}
      {stats?.byPriority && Object.keys(stats.byPriority).length > 0 && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <BarChart2 size={18} color="#818cf8" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9' }}>Priority Breakdown</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { key: 'urgent', label: 'Urgent', color: '#ef4444' },
              { key: 'high', label: 'High', color: '#f59e0b' },
              { key: 'medium', label: 'Medium', color: '#818cf8' },
              { key: 'low', label: 'Low', color: '#10b981' },
            ].map(({ key, label, color }) => {
              const count = stats.byPriority[key] || 0;
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: '0.8rem', color, fontWeight: 600 }}>{count} tasks ({pct}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div style={{
                      height: '100%', borderRadius: '10px', width: `${pct}%`,
                      background: color, transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent tasks */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9' }}>Recent Tasks</h3>
          <Link to="/tasks" style={{ fontSize: '0.8rem', color: '#818cf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '16px' }} />
            ))}
          </div>
        ) : recentTasks.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {recentTasks.map((task) => <TaskCard key={task._id} task={task} />)}
          </div>
        ) : (
          <div className="glass-card" style={{
            padding: '3rem', textAlign: 'center',
            background: 'rgba(99,102,241,0.05)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>No tasks yet</p>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>Create your first task to get started!</p>
            <button onClick={() => context?.openTaskModal()} className="btn-primary"
              style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={15} /> Create Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
