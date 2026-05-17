import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, fetchStats, createTask, editTask, deleteTask } from '../store/taskThunks';
import { setFilters, resetFilters, setSelectedTask } from '../store/tasksSlice';
import { useEffect } from 'react';

export const useTasks = () => {
  const dispatch = useDispatch();
  const { tasks, stats, loading, statsLoading, error, filters, selectedTask, pagination } =
    useSelector((state) => state.tasks);

  const loadTasks = (overrideFilters = null) => {
    dispatch(fetchTasks(overrideFilters || filters));
  };

  const loadStats = () => {
    dispatch(fetchStats());
  };

  const updateFilters = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const clearFilters = () => {
    dispatch(resetFilters());
  };

  const createNewTask = async (taskData) => {
    const task = await dispatch(createTask(taskData));
    dispatch(fetchStats());
    return task;
  };

  const updateExistingTask = async (id, taskData) => {
    const task = await dispatch(editTask(id, taskData));
    dispatch(fetchStats());
    return task;
  };

  const removeTask = async (id) => {
    await dispatch(deleteTask(id));
    dispatch(fetchStats());
  };

  const selectTask = (task) => {
    dispatch(setSelectedTask(task));
  };

  return {
    tasks,
    stats,
    loading,
    statsLoading,
    error,
    filters,
    selectedTask,
    pagination,
    loadTasks,
    loadStats,
    updateFilters,
    clearFilters,
    createNewTask,
    updateExistingTask,
    removeTask,
    selectTask,
  };
};
