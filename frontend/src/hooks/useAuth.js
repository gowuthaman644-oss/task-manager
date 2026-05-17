import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials, logout, updateUser } from '../store/authSlice';
import api from '../services/api';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    dispatch(setCredentials({ user: data.user, token: data.token }));
    navigate('/dashboard');
    return data;
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    dispatch(setCredentials({ user: data.user, token: data.token }));
    navigate('/dashboard');
    return data;
  };

  const logoutUser = () => {
    dispatch(logout());
    navigate('/login');
  };

  const updateProfile = async (name) => {
    const { data } = await api.put('/auth/profile', { name });
    dispatch(updateUser(data.user));
    return data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
    return data;
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout: logoutUser,
    updateProfile,
    changePassword,
  };
};
