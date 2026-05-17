import { format, formatDistanceToNow, isAfter, isBefore, isToday, isTomorrow, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return 'No due date';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy • hh:mm a');
};

export const formatRelative = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
};

export const isOverdue = (date) => {
  if (!date) return false;
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(d, new Date()) && !isToday(d);
};

export const getDueDateLabel = (date) => {
  if (!date) return null;
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return { label: 'Due Today', color: '#f59e0b' };
  if (isTomorrow(d)) return { label: 'Due Tomorrow', color: '#06b6d4' };
  if (isOverdue(d)) return { label: 'Overdue', color: '#ef4444' };
  return { label: formatDate(d), color: '#94a3b8' };
};

export const getPriorityColor = (priority) => {
  const map = {
    urgent: '#ef4444',
    high: '#f59e0b',
    medium: '#818cf8',
    low: '#10b981',
  };
  return map[priority] || '#94a3b8';
};

export const getStatusColor = (status) => {
  const map = {
    todo: '#94a3b8',
    'in-progress': '#06b6d4',
    completed: '#10b981',
    cancelled: '#64748b',
  };
  return map[status] || '#94a3b8';
};

export const getCategoryIcon = (category) => {
  const map = {
    work: '💼',
    personal: '🏠',
    shopping: '🛒',
    health: '❤️',
    finance: '💰',
    education: '📚',
    other: '📌',
  };
  return map[category] || '📌';
};

export const getPriorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };

export const truncate = (str, max = 80) => {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '...' : str;
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
