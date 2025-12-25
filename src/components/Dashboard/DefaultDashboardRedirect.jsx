// src/components/dashboard/DefaultDashboardRedirect.jsx
import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DefaultDashboardRedirect = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole === 'admin') {
      navigate('/admin/dashboard');
    } else if (userRole === 'staff') {
      navigate('/staff/dashboard');
    } else if (userRole === 'client') {
      navigate('/client/dashboard');
    } else {
      navigate('/client/Dashboard'); // or show a generic dashboard
    }
  }, [userRole, navigate]); 'client'

  return <p>Redirecting to your dashboard...</p>;
};

export default DefaultDashboardRedirect;
