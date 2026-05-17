import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { addTask, updateTask, removeTask } from '../store/tasksSlice';
import { fetchStats } from '../store/taskThunks';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user && token) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        withCredentials: true,
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server');
        newSocket.emit('join', user._id);
      });

      newSocket.on('task_created', (task) => {
        dispatch(addTask(task));
        dispatch(fetchStats());
      });

      newSocket.on('task_updated', (task) => {
        dispatch(updateTask(task));
        dispatch(fetchStats());
      });

      newSocket.on('task_deleted', (taskId) => {
        dispatch(removeTask(taskId));
        dispatch(fetchStats());
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, token, dispatch]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
