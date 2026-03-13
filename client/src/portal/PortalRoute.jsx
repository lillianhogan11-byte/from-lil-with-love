import React from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn } from './auth';

export default function PortalRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/portal/login" replace />;
}
