import { useEffect, useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/tasks/TaskCard';
import FilterBar from '../components/tasks/FilterBar';
import TaskModal from '../components/tasks/TaskModal';
import { ListTodo, LayoutGrid, List, Plus, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const Tasks = () => {
  const { tasks, loading, error, filters, loadTasks, loadStats, updateExistingTask } = useTasks();
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [showModal, setShowModal] = useState(false);
  const [activeDropColumn, setActiveDropColumn] = useState(null);

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e, status) => {
    e.preventDefault();
    setActiveDropColumn(status);
  };

  const handleDragLeave = () => {
    setActiveDropColumn(null);
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    setActiveDropColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;
    if (task.status === status) return;

    try {
      await updateExistingTask(taskId, {
        status,
        progress: status === 'completed' ? 100 : task.progress
      });
      const labels = {
        todo: '📋 Moved to To Do',
        'in-progress': '⚡ Moved to In Progress',
        completed: '✅ Moved to Completed',
        cancelled: '🚫 Moved to Cancelled',
      };
      toast.success(labels[status] || 'Task updated!');
    } catch {
      toast.error('Failed to move task');
    }
  };

  const grouped = {
    todo: tasks.filter((t) => t.status === 'todo'),
    'in-progress': tasks.filter((t) => t.status === 'in-progress'),
    completed: tasks.filter((t) => t.status === 'completed'),
    cancelled: tasks.filter((t) => t.status === 'cancelled'),
  };

  const statusMeta = {
    todo: { label: 'To Do', color: '#94a3b8', emoji: '📋' },
    'in-progress': { label: 'In Progress', color: '#06b6d4', emoji: '⚡' },
    completed: { label: 'Completed', color: '#10b981', emoji: '✅' },
    cancelled: { label: 'Cancelled', color: '#64748b', emoji: '🚫' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <ListTodo size={22} color="#818cf8" />
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>
              All Tasks
              <span style={{
                marginLeft: '8px', fontSize: '0.75rem', fontWeight: 600,
                background: 'rgba(99,102,241,0.15)', color: '#818cf8',
                padding: '2px 10px', borderRadius: '12px',
              }}>{tasks.length}</span>
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Refresh */}
          <button onClick={() => loadTasks()} style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifycontent: 'center', color: '#64748b',
          }}>
            <RefreshCw size={15} />
          </button>

          {/* View mode */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            {[{ v: 'grid', Icon: LayoutGrid }, { v: 'list', Icon: List }].map(({ v, Icon }) => (
              <button key={v} onClick={() => setViewMode(v)} style={{
                padding: '0.5rem 0.75rem', border: 'none', cursor: 'pointer',
                background: viewMode === v ? 'rgba(99,102,241,0.25)' : 'transparent',
                color: viewMode === v ? '#818cf8' : '#64748b', transition: 'all 0.15s',
              }}>
                <Icon size={15} />
              </button>
            ))}
          </div>

          <button onClick={() => setShowModal(true)} className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '0.55rem 1rem' }}>
            <Plus size={15} /> Add Task
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Error */}
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#ef4444', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '16px' }} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔍</div>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: 600 }}>No tasks found</p>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Try adjusting your filters or create a new task
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary"
            style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={15} /> Create Task
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Kanban Board Grid View */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.25rem',
          alignItems: 'start',
        }}>
          {Object.entries(statusMeta).map(([status, meta]) => {
            const statusTasks = grouped[status] || [];
            const isActive = activeDropColumn === status;

            return (
              <div
                key={status}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status)}
                className="glass-card"
                style={{
                  padding: '1rem',
                  background: isActive ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                  borderColor: isActive ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.04)',
                  transition: 'all 0.23s cubic-bezier(0.4, 0, 0.2, 1)',
                  minHeight: '450px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  boxShadow: isActive ? '0 8px 32px rgba(99, 102, 241, 0.15)' : 'none',
                }}
              >
                {/* Column header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '8px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  marginBottom: '4px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem' }}>{meta.emoji}</span>
                    <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: meta.color, margin: 0 }}>
                      {meta.label}
                    </h3>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: `${meta.color}15`,
                    color: meta.color,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    border: `1px solid ${meta.color}30`,
                  }}>
                    {statusTasks.length}
                  </span>
                </div>

                {/* Column body */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  flex: 1,
                  overflowY: 'auto',
                }}>
                  {statusTasks.length === 0 ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 1,
                      border: '2px dashed rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      padding: '2rem 1rem',
                      color: '#475569',
                      fontSize: '0.78rem',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>📥</div>
                      Drop tasks here
                    </div>
                  ) : (
                    statusTasks.map((task) => (
                      <TaskCard key={task._id} task={task} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List view */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tasks.map((task) => <TaskCard key={task._id} task={task} />)}
        </div>
      )}

      {showModal && <TaskModal mode="create" onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Tasks;
