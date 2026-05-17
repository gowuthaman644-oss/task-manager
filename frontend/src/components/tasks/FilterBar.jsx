import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { useEffect, useRef, useState } from 'react';

const STATUSES = ['', 'todo', 'in-progress', 'completed', 'cancelled'];
const PRIORITIES = ['', 'low', 'medium', 'high', 'urgent'];
const CATEGORIES = ['', 'work', 'personal', 'shopping', 'health', 'finance', 'education', 'other'];
const SORTS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: 'dueDate', label: 'Due Date ↑' },
  { value: '-dueDate', label: 'Due Date ↓' },
  { value: '-priority', label: 'Priority High→Low' },
  { value: 'priority', label: 'Priority Low→High' },
];

const FilterBar = ({ onSearch }) => {
  const { filters, updateFilters, clearFilters, loadTasks } = useTasks();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const handleSearch = (e) => {
    const value = e.target.value;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateFilters({ search: value });
    }, 400);
  };

  const hasActiveFilters = filters.status || filters.priority || filters.category || filters.search;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Search + toggle row */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            ref={searchRef}
            type="text"
            defaultValue={filters.search}
            onChange={handleSearch}
            placeholder="Search tasks..."
            className="input-field"
            style={{ paddingLeft: '2.5rem', paddingRight: filters.search ? '2.5rem' : '1rem' }}
          />
          {filters.search && (
            <button onClick={() => { updateFilters({ search: '' }); if (searchRef.current) searchRef.current.value = ''; }}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) => updateFilters({ sort: e.target.value })}
          className="input-field"
          style={{ width: 'auto', minWidth: '160px' }}
        >
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {/* Filter toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '0.65rem 1rem', borderRadius: '10px',
            background: showAdvanced ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${showAdvanced ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
            cursor: 'pointer', color: showAdvanced ? '#818cf8' : '#94a3b8',
            fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasActiveFilters && (
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1' }} />
          )}
          <ChevronDown size={13} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {/* Clear */}
        {hasActiveFilters && (
          <button onClick={clearFilters} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '0.65rem 0.875rem', borderRadius: '10px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            cursor: 'pointer', color: '#ef4444', fontSize: '0.8rem', fontWeight: 500,
            whiteSpace: 'nowrap',
          }}>
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="fade-in" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select value={filters.status} onChange={(e) => updateFilters({ status: e.target.value })} className="input-field" style={{ width: 'auto', minWidth: '140px' }}>
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}</option>)}
          </select>

          <select value={filters.priority} onChange={(e) => updateFilters({ priority: e.target.value })} className="input-field" style={{ width: 'auto', minWidth: '140px' }}>
            <option value="">All Priorities</option>
            {PRIORITIES.filter(Boolean).map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>

          <select value={filters.category} onChange={(e) => updateFilters({ category: e.target.value })} className="input-field" style={{ width: 'auto', minWidth: '150px' }}>
            <option value="">All Categories</option>
            {CATEGORIES.filter(Boolean).map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
