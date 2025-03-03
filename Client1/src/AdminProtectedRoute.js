import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AdminProtectedRoute = () => {
  const { token } = useAuth();

  if (!token) {
    // Redirect to login page if not authenticated
    return <Navigate to="/adminlogin" />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
