import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('taskflow_token');
let user = null;

try {
  const storedUser = localStorage.getItem('taskflow_user');
  if (storedUser && storedUser !== 'undefined') {
    user = JSON.parse(storedUser);
  }
} catch (e) {
  console.warn('Failed to parse stored user credentials:', e);
  localStorage.removeItem('taskflow_user');
  localStorage.removeItem('taskflow_token');
}

const initialState = {
  user: user,
  token: token || null,
  isAuthenticated: !!token && !!user,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('taskflow_token', token);
      localStorage.setItem('taskflow_user', JSON.stringify(user));
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('taskflow_user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
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

export const { setCredentials, updateUser, logout, setLoading, setError, clearError } =
  authSlice.actions;

export default authSlice.reducer;
