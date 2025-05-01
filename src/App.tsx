import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import React, { ReactNode, useEffect, useState } from 'react';
import Password from "@/components/Password"
import Journal from "@/components/Journal"
const isAuthenticated = () => localStorage.getItem('token');

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const token = isAuthenticated();

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        navigate('/login', { replace: true });
      }
    };
    checkAuth();

    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AuthenticationWrapper = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && !e.newValue) {
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  return <>{children}</>;
};

function App() {

  return (
    <>
      <Router>
        <AuthenticationWrapper>
          <Routes>
          <Route 
            path="/login" 
            element={<Password/>} 
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Journal />
              </PrivateRoute>
            }
          />
          </Routes>
        </AuthenticationWrapper>
      </Router>
    </>
  )
}

export default App
