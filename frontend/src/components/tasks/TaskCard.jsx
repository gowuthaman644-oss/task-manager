import { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { Edit2, Trash2, Clock, Flag, CheckCircle2, Circle, MoreVertical, Tag } from 'lucide-react';
import {
  formatDate, isOverdue, getDueDateLabel,
  getPriorityColor, getStatusColor, getCategoryIcon, truncate
} from '../../utils/helpers';
import TaskModal from './TaskModal';
import toast from 'react-hot-toast';

const priorityIcons = { urgent: '🔴', high: '🟠', medium: '🔵', low: '🟢' };

const TaskCard = ({ task }) => {
  const { updateExistingTask, removeTask } = useTasks();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dueDateInfo = getDueDateLabel(task.dueDate);
  const overdue = isOverdue(task.dueDate) && task.status !== 'completed';

  const toggleComplete = async () => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      await updateExistingTask(task._id, { status: newStatus, progress: newStatus === 'completed' ? 100 : task.progress });
      toast.success(newStatus === 'completed' ? '✅ Task completed!' : '↩️ Task reopened');
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removeTask(task._id);
      toast.success('🗑️ Task deleted');
    } catch {
      toast.error('Failed to delete task');
      setDeleting(false);
    }
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const isCompleted = task.status === 'completed';

  return (
    <>
      <div className="glass-card fade-in"
        draggable={true}
        onDragStart={handleDragStart}
        style={{
          padding: '1.1rem', transition: 'all 0.2s',
          opacity: deleting ? 0.5 : 1,
          borderLeft: `3px solid ${getPriorityColor(task.priority)}`,
          cursor: 'grab',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        {/* Row 1: checkbox + title + menu */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <button onClick={toggleComplete} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', marginTop: '1px', flexShrink: 0 }}>
            {isCompleted
              ? <CheckCircle2 size={20} color="#10b981" fill="rgba(16,185,129,0.15)" />
              : <Circle size={20} color="#475569" />}
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '0.9rem', fontWeight: 600, color: isCompleted ? '#475569' : '#f1f5f9',
              textDecoration: isCompleted ? 'line-through' : 'none',
              lineHeight: 1.4, wordBreak: 'break-word',
            }}>
              {getCategoryIcon(task.category)} {task.title}
            </p>

            {task.description && (
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', lineHeight: 1.5 }}>
                {truncate(task.description, 100)}
              </p>
            )}
          </div>

          {/* Menu */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button onClick={() => setShowMenu(!showMenu)} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: '#475569',
              padding: '4px', borderRadius: '6px', transition: 'all 0.15s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#475569'; }}
            >
              <MoreVertical size={16} />
            </button>

            {showMenu && (
              <div className="glass-card" style={{
                position: 'absolute', right: 0, top: '30px', zIndex: 10,
                minWidth: '130px', padding: '0.4rem', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
                onMouseLeave={() => setShowMenu(false)}
              >
                <button onClick={() => { setShowEditModal(true); setShowMenu(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '0.5rem 0.75rem', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#94a3b8', fontSize: '0.83rem', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => { handleDelete(); setShowMenu(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '0.5rem 0.75rem', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#ef4444', fontSize: '0.83rem', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {task.progress > 0 && task.progress < 100 && (
          <div style={{ marginTop: '10px' }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${task.progress}%` }} />
            </div>
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px', textAlign: 'right' }}>{task.progress}%</p>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
            {task.tags.slice(0, 3).map((tag) => (
              <span key={tag} style={{
                fontSize: '0.68rem', padding: '2px 8px', borderRadius: '12px',
                background: 'rgba(99,102,241,0.1)', color: '#818cf8',
                border: '1px solid rgba(99,102,241,0.2)',
              }}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Priority */}
            <span style={{ fontSize: '0.7rem', color: getPriorityColor(task.priority), fontWeight: 600 }}>
              {priorityIcons[task.priority]} {task.priority}
            </span>

            {/* Status */}
            <span style={{
              fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px',
              background: `${getStatusColor(task.status)}15`,
              color: getStatusColor(task.status),
              border: `1px solid ${getStatusColor(task.status)}30`,
              fontWeight: 600,
            }}>
              {task.status.replace('-', ' ')}
            </span>
          </div>

          {/* Due date */}
          {dueDateInfo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={11} color={overdue ? '#ef4444' : '#64748b'} />
              <span style={{ fontSize: '0.7rem', color: overdue ? '#ef4444' : '#64748b', fontWeight: overdue ? 600 : 400 }}>
                {dueDateInfo.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <TaskModal
          mode="edit"
          task={task}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
};

export default TaskCard;
