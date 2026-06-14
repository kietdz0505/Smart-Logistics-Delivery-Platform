import { createContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const res = await axiosClient.get('/users/me');
    setUser(res.data);
    localStorage.setItem('userInfo', JSON.stringify(res.data));
    return res.data;
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      return await refreshUser();
    } catch (err) {
      console.error('Fetch /me failed:', err);
      logout();
    }
  }, [refreshUser]);

  const login = async (authData) => {
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);

    await fetchMe();
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const cached = localStorage.getItem('userInfo');

        if (cached) setUser(JSON.parse(cached));

        await fetchMe();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [fetchMe]);

  useEffect(() => {
    const handler = () => {
      refreshUser();
    };

    window.addEventListener('user-updated', handler);
    return () => window.removeEventListener('user-updated', handler);
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};