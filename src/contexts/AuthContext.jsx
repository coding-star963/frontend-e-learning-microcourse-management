import { useState, useCallback } from 'react';
import api from '../services/api';
import { AuthContext } from './auth-context';

function useAuthState() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get('/user');
      const userData = response.data.data;
      if (userData?.role === 'student') {
        localStorage.removeItem('token');
        setUser(null);
        return;
      }
      setUser(userData);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await api.post('/login', { email, password });
    const { user: userData, token } = response.data;
    if (userData.role === 'student') {
      throw {
        response: {
          data: {
            message: 'Access restricted to administrators and teachers. Students must access courses via the mobile application.',
          },
        },
      };
    }
    localStorage.setItem('token', token);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/logout');
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    const response = await api.put('/profile', data);
    setUser(response.data.user);
    return response.data;
  }, []);

  const updatePassword = useCallback(async (data) => {
    const response = await api.put('/profile/password', data);
    return response.data;
  }, []);

  const updatePhoto = useCallback(async (formData) => {
    const response = await api.post('/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    setUser(response.data.user);
    return response.data;
  }, []);

  const deletePhoto = useCallback(async () => {
    const response = await api.delete('/profile/photo');
    setUser(response.data.user);
    return response.data;
  }, []);

  return {
    user,
    loading,
    setLoading,
    fetchUser,
    login,
    logout,
    updateProfile,
    updatePassword,
    updatePhoto,
    deletePhoto,
  };
}

export function AuthProvider({ children }) {
  const auth = useAuthState();
  const [initialized, setInitialized] = useState(false);

  if (!initialized) {
    const token = localStorage.getItem('token');
    if (token) {
      auth.fetchUser();
    } else {
      auth.setLoading(false);
    }
    setInitialized(true);
  }

  return (
    <AuthContext.Provider value={{
      user: auth.user,
      loading: auth.loading,
      login: auth.login,
      logout: auth.logout,
      updateProfile: auth.updateProfile,
      updatePassword: auth.updatePassword,
      updatePhoto: auth.updatePhoto,
      deletePhoto: auth.deletePhoto,
      isAdmin: auth.user?.role === 'administrator',
      isTeacher: auth.user?.role === 'teacher',
    }}>
      {children}
    </AuthContext.Provider>
  );
}