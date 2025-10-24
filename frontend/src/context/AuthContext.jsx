import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadAdmin(token);
    } else {
      setLoading(false);
    }
  }, []);

  const loadAdmin = async (token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const { data } = await axios.get(`${API_URL}/auth/me`, config);
      setAdmin(data);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
    localStorage.setItem('token', data.token);
    setAdmin(data);
    return data;
  };

  const signup = async (name, email, password) => {
    const { data } = await axios.post(`${API_URL}/auth/signup`, { name, email, password });
    localStorage.setItem('token', data.token);
    setAdmin(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAdmin(null);
  };

  const forgotPassword = async (email) => {
    const { data } = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return data;
  };

  const resetPassword = async (token, password) => {
    const { data } = await axios.post(`${API_URL}/auth/reset-password/${token}`, { password });
    return data;
  };

  return (
    <AuthContext.Provider value={{
      admin,
      loading,
      login,
      signup,
      logout,
      forgotPassword,
      resetPassword,
      API_URL
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;