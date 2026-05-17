import { useEffect, useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth,
  isSameDay, isToday, parseISO, startOfWeek, endOfWeek
} from 'date-fns';
import { getPriorityColor } from '../utils/helpers';
import TaskModal from '../components/tasks/TaskModal';

const CalendarPage = () => {
  const { tasks, loadTasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [editTask, setEditTask] = useState(null);

  useEffect(() => { loadTasks(); }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getTasksForDay = (day) =>
    tasks.filter((t) => t.dueDate && isSameDay(parseISO(t.dueDate), day));

  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  const prevMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <CalIcon size={22} color="#818cf8" />
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>Calendar</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem' }}>
        {/* Calendar grid */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <button onClick={prevMonth} style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8',
            }}><ChevronLeft size={16} /></button>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <button onClick={nextMonth} style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8',
            }}><ChevronRight size={16} /></button>
          </div>

          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', padding: '4px' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {days.map((day) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const todayDay = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    minHeight: '64px', padding: '6px', borderRadius: '10px', cursor: 'pointer',
                    background: isSelected
                      ? 'rgba(99,102,241,0.2)'
                      : todayDay
                      ? 'rgba(99,102,241,0.08)'
                      : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isSelected ? 'rgba(99,102,241,0.5)' : todayDay ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)'}`,
                    transition: 'all 0.15s',
                    opacity: isCurrentMonth ? 1 : 0.35,
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = isCurrentMonth && todayDay ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)'; }}
                >
                  <p style={{
                    fontSize: '0.78rem', fontWeight: todayDay ? 700 : 500,
                    color: todayDay ? '#818cf8' : isCurrentMonth ? '#f1f5f9' : '#475569',
                    marginBottom: '4px',
                  }}>
                    {format(day, 'd')}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {dayTasks.slice(0, 3).map((t) => (
                      <div key={t._id} onClick={(e) => { e.stopPropagation(); setEditTask(t); }}
                        style={{
                          fontSize: '0.62rem', padding: '2px 4px', borderRadius: '4px',
                          background: `${getPriorityColor(t.priority)}20`,
                          color: getPriorityColor(t.priority),
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          cursor: 'pointer', border: `1px solid ${getPriorityColor(t.priority)}30`,
                        }}>
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <span style={{ fontSize: '0.6rem', color: '#64748b' }}>+{dayTasks.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected day panel */}
        <div className="glass-card" style={{ padding: '1.25rem', height: 'fit-content', position: 'sticky', top: '80px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '1rem' }}>
            {selectedDay ? format(selectedDay, 'EEEE, MMMM d') : 'Select a day'}
          </h3>

          {!selectedDay ? (
            <p style={{ color: '#64748b', fontSize: '0.82rem', textAlign: 'center', padding: '2rem 0' }}>
              Click on a day to see tasks
            </p>
          ) : selectedDayTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
              <p style={{ color: '#64748b', fontSize: '0.82rem' }}>No tasks due this day</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {selectedDayTasks.map((task) => (
                <div key={task._id}
                  onClick={() => setEditTask(task)}
                  style={{
                    padding: '0.75rem', borderRadius: '10px', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.04)', border: `1px solid ${getPriorityColor(task.priority)}25`,
                    borderLeft: `3px solid ${getPriorityColor(task.priority)}`,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                >
                  <p style={{ fontSize: '0.83rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '4px' }}>{task.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: getPriorityColor(task.priority), fontWeight: 600 }}>
                      {task.priority}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>•</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{task.status.replace('-', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editTask && (
        <TaskModal mode="edit" task={editTask} onClose={() => setEditTask(null)} />
      )}
    </div>
  );
};

export default CalendarPage;
