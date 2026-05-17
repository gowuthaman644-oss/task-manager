import { useState, useEffect } from 'react';
import { useTasks } from '../../hooks/useTasks';
import {
  X, Calendar, Flag, Tag, AlignLeft, Type,
  Loader2, Folder, TrendingUp, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = ['todo', 'in-progress', 'completed', 'cancelled'];
const CATEGORIES = ['work', 'personal', 'shopping', 'health', 'finance', 'education', 'other'];

const priorityColors = { low: '#10b981', medium: '#818cf8', high: '#f59e0b', urgent: '#ef4444' };
const statusColors = { todo: '#94a3b8', 'in-progress': '#06b6d4', completed: '#10b981', cancelled: '#64748b' };

const TaskModal = ({ onClose, mode = 'create', task = null, onSuccess }) => {
  const { createNewTask, updateExistingTask, loadStats } = useTasks();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    category: task?.category || 'other',
    dueDate: task?.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
    tags: task?.tags?.join(', ') || '',
    progress: task?.progress || 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Task title is required');

    setLoading(true);
    try {
      const payload = {
        ...formData,
        progress: parseInt(formData.progress),
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        dueDate: formData.dueDate || null,
      };

      if (mode === 'create') {
        await createNewTask(payload);
        toast.success('✅ Task created successfully!');
      } else {
        await updateExistingTask(task._id, payload);
        toast.success('✏️ Task updated successfully!');
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Close on ESC
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fade-in glass-card" style={{
        width: '100%', maxWidth: '560px', maxHeight: '90vh',
        overflowY: 'auto', padding: '1.75rem',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9' }}>
              {mode === 'create' ? '✨ New Task' : '✏️ Edit Task'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              {mode === 'create' ? 'Add a new task to your workspace' : 'Update task details'}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8',
          }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8' }}>
              <Type size={13} /> Title *
            </label>
            <input
              type="text" name="title" value={formData.title} onChange={handleChange}
              placeholder="What needs to be done?" className="input-field"
              autoFocus style={{ fontSize: '1rem', fontWeight: 500 }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8' }}>
              <AlignLeft size={13} /> Description
            </label>
            <textarea
              name="description" value={formData.description} onChange={handleChange}
              placeholder="Add more details..." rows={3} className="input-field"
              style={{ resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {/* Priority & Status row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8' }}>
                <Flag size={13} /> Priority
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {PRIORITIES.map((p) => (
                  <button key={p} type="button" onClick={() => setFormData((prev) => ({ ...prev, priority: p }))}
                    style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                      cursor: 'pointer', border: '1px solid',
                      borderColor: formData.priority === p ? priorityColors[p] : 'rgba(255,255,255,0.1)',
                      background: formData.priority === p ? `${priorityColors[p]}20` : 'transparent',
                      color: formData.priority === p ? priorityColors[p] : '#64748b',
                      transition: 'all 0.15s',
                    }}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8' }}>
                <Check size={13} /> Status
              </label>
              <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category & Due Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8' }}>
                <Folder size={13} /> Category
              </label>
              <select name="category" value={formData.category} onChange={handleChange} className="input-field">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8' }}>
                <Calendar size={13} /> Due Date
              </label>
              <input
                type="date" name="dueDate" value={formData.dueDate} onChange={handleChange}
                className="input-field"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* Progress */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={13} /> Progress
              </span>
              <span style={{ color: '#818cf8', fontWeight: 700 }}>{formData.progress}%</span>
            </label>
            <input
              type="range" name="progress" min="0" max="100" value={formData.progress}
              onChange={handleChange}
              style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
            />
            <div className="progress-bar" style={{ marginTop: '6px' }}>
              <div className="progress-fill" style={{ width: `${formData.progress}%` }} />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8' }}>
              <Tag size={13} /> Tags <span style={{ color: '#475569', fontSize: '0.7rem' }}>(comma-separated)</span>
            </label>
            <input
              type="text" name="tags" value={formData.tags} onChange={handleChange}
              placeholder="design, frontend, urgent..." className="input-field"
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Saving...' : (mode === 'create' ? 'Create Task' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
