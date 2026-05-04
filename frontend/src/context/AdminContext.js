import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const savedToken = localStorage.getItem('adminToken');
    const savedUser = localStorage.getItem('adminUser');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setAdminUser(JSON.parse(savedUser));
        setIsAdminAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved admin data:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
    
    setLoading(false);
  }, []);

  const adminLogin = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      
      // Allow both admin and manager roles
      if (response.data.user.role !== 'admin' && response.data.user.role !== 'manager') {
        throw new Error('Nu ai permisiuni de administrator sau manager');
      }

      const { access_token, user } = response.data;
      
      setToken(access_token);
      setAdminUser(user);
      setIsAdminAuthenticated(true);
      
      localStorage.setItem('adminToken', access_token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  const adminLogout = () => {
    setToken(null);
    setAdminUser(null);
    setIsAdminAuthenticated(false);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  const getAuthHeaders = () => {
    const currentToken = token || localStorage.getItem('adminToken');
    if (!currentToken) {
      console.warn('No admin token available');
      return { headers: {} };
    }
    return {
      headers: {
        'Authorization': `Bearer ${currentToken}`
      }
    };
  };

  return (
    <AdminContext.Provider
      value={{
        adminUser,
        isAdminAuthenticated,
        token,
        loading,
        adminLogin,
        adminLogout,
        getAuthHeaders
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
