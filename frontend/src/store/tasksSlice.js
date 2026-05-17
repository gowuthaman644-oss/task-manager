import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [],
  filteredTasks: [],
  stats: null,
  loading: false,
  statsLoading: false,
  error: null,
  filters: {
    status: '',
    priority: '',
    category: '',
    search: '',
    sort: '-createdAt',
  },
  selectedTask: null,
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
  },
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload.tasks;
      state.pagination = {
        page: action.payload.page,
        pages: action.payload.pages,
        total: action.payload.total,
      };
      state.loading = false;
      state.error = null;
    },
    addTask: (state, action) => {
      state.tasks.unshift(action.payload);
      if (state.pagination) state.pagination.total += 1;
    },
    updateTask: (state, action) => {
      const idx = state.tasks.findIndex((t) => t._id === action.payload._id);
      if (idx !== -1) state.tasks[idx] = action.payload;
      if (state.selectedTask?._id === action.payload._id) {
        state.selectedTask = action.payload;
      }
    },
    removeTask: (state, action) => {
      state.tasks = state.tasks.filter((t) => t._id !== action.payload);
      if (state.pagination) state.pagination.total -= 1;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
      state.statsLoading = false;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setStatsLoading: (state, action) => {
      state.statsLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  removeTask,
  setStats,
  setFilters,
  resetFilters,
  setSelectedTask,
  setLoading,
  setStatsLoading,
  setError,
  clearError,
} = tasksSlice.actions;

export default tasksSlice.reducer;
