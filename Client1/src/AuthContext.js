import React, { createContext, useState, useContext } from 'react';

// Create a Context for Auth
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(sessionStorage.getItem('token'));

  const login = (token) => {
    sessionStorage.setItem('token', token);
    setToken(token);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
