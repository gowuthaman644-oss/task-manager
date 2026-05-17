import api from '../services/api';
import {
  setTasks, addTask, updateTask, removeTask,
  setStats, setLoading, setStatsLoading, setError,
} from '../store/tasksSlice';

export const fetchTasks = (filters = {}) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);

    const { data } = await api.get(`/tasks?${params.toString()}`);
    dispatch(setTasks(data));
  } catch (err) {
    dispatch(setError(err.response?.data?.message || 'Failed to fetch tasks'));
  }
};

export const fetchStats = () => async (dispatch) => {
  dispatch(setStatsLoading(true));
  try {
    const { data } = await api.get('/tasks/stats');
    dispatch(setStats(data.stats));
  } catch (err) {
    dispatch(setStatsLoading(false));
  }
};

export const createTask = (taskData) => async (dispatch) => {
  const { data } = await api.post('/tasks', taskData);
  dispatch(addTask(data.task));
  return data.task;
};

export const editTask = (id, taskData) => async (dispatch) => {
  const { data } = await api.put(`/tasks/${id}`, taskData);
  dispatch(updateTask(data.task));
  return data.task;
};

export const deleteTask = (id) => async (dispatch) => {
  await api.delete(`/tasks/${id}`);
  dispatch(removeTask(id));
};
