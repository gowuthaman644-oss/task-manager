import { useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { BarChart2, TrendingUp, Zap, Target, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getCategoryIcon } from '../utils/helpers';

const Bar = ({ label, value, max, color, emoji }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: '90px', fontSize: '0.8rem', color: '#94a3b8', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
        {emoji && <span>{emoji}</span>} {label}
      </div>
      <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '10px', transition: 'width 0.8s ease' }} />
      </div>
      <span style={{ fontSize: '0.8rem', color, fontWeight: 700, width: '28px', textAlign: 'right', flexShrink: 0 }}>{value}</span>
    </div>
  );
};

const Analytics = () => {
  const { stats, statsLoading, loadStats, tasks, loadTasks, filters } = useTasks();

  useEffect(() => {
    loadStats();
    loadTasks();
  }, []);

  const total = stats?.total || 0;

  const categoryData = Object.entries(stats?.byCategory || {}).sort((a, b) => b[1] - a[1]);
  const maxCategory = categoryData.reduce((m, [, v]) => Math.max(m, v), 0);

  // Compute avg completion time from completed tasks
  const completedTasks = tasks.filter((t) => t.status === 'completed' && t.completedAt && t.createdAt);
  const avgDays = completedTasks.length > 0
    ? Math.round(completedTasks.reduce((sum, t) => {
        const diff = (new Date(t.completedAt) - new Date(t.createdAt)) / (1000 * 60 * 60 * 24);
        return sum + diff;
      }, 0) / completedTasks.length)
    : null;

  if (statsLoading) {
    return (
      <div style={{ display: 'grid', gap: '1rem' }}>
        {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: '180px', borderRadius: '16px' }} />)}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <BarChart2 size={22} color="#818cf8" />
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>Analytics</h2>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          { icon: Target, label: 'Total Tasks', value: total, color: '#818cf8' },
          { icon: CheckCircle2, label: 'Completed', value: stats?.byStatus?.completed || 0, color: '#10b981' },
          { icon: Clock, label: 'In Progress', value: stats?.byStatus?.['in-progress'] || 0, color: '#06b6d4' },
          { icon: AlertTriangle, label: 'Overdue', value: stats?.overdue || 0, color: '#ef4444' },
          { icon: Zap, label: 'Done This Week', value: stats?.completedThisWeek || 0, color: '#a78bfa' },
          { icon: TrendingUp, label: 'Completion Rate', value: `${stats?.completionRate || 0}%`, color: '#f59e0b' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass-card" style={{ padding: '1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <Icon size={16} color={color} />
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{label}</p>
            </div>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Status distribution */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818cf8', display: 'inline-block' }} />
          Status Distribution
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {[
            { key: 'todo', label: 'To Do', color: '#94a3b8' },
            { key: 'in-progress', label: 'In Progress', color: '#06b6d4' },
            { key: 'completed', label: 'Completed', color: '#10b981' },
            { key: 'cancelled', label: 'Cancelled', color: '#64748b' },
          ].map(({ key, label, color }) => (
            <Bar key={key} label={label} value={stats?.byStatus?.[key] || 0} max={total} color={color} />
          ))}
        </div>
      </div>

      {/* Priority distribution */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
          Priority Breakdown
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {[
            { key: 'urgent', label: 'Urgent', color: '#ef4444', emoji: '🔴' },
            { key: 'high', label: 'High', color: '#f59e0b', emoji: '🟠' },
            { key: 'medium', label: 'Medium', color: '#818cf8', emoji: '🔵' },
            { key: 'low', label: 'Low', color: '#10b981', emoji: '🟢' },
          ].map(({ key, label, color, emoji }) => (
            <Bar key={key} label={label} value={stats?.byPriority?.[key] || 0} max={total} color={color} emoji={emoji} />
          ))}
        </div>
      </div>

      {/* Category breakdown */}
      {categoryData.length > 0 && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4', display: 'inline-block' }} />
            Tasks by Category
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {categoryData.map(([cat, count]) => (
              <Bar key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)} value={count} max={maxCategory} color="#06b6d4" emoji={getCategoryIcon(cat)} />
            ))}
          </div>
        </div>
      )}

      {/* Avg completion time */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={16} color="#a78bfa" /> Productivity Insights
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(167,139,250,0.08)', borderRadius: '12px', border: '1px solid rgba(167,139,250,0.15)' }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>Avg. Completion Time</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a78bfa' }}>
              {avgDays !== null ? `${avgDays}d` : 'N/A'}
            </p>
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>from {completedTasks.length} tasks</p>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.08)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.15)' }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>Pending Tasks</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{stats?.byStatus?.todo || 0}</p>
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>awaiting action</p>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.08)', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.15)' }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>Due Today</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{stats?.dueToday || 0}</p>
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>need attention</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
