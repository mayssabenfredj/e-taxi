import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shareds/contexts/AuthContext';
import { Dashboard } from '@/features/dashboard/pages/Dashboard';
import { LandingPage } from '@/features/leanding/pages/LandingPage';

const Index = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-etaxi-yellow"></div>
      </div>
    );
  }

  // If authenticated, show dashboard
  if (isAuthenticated && user) {
    return <Dashboard />;
  }

  // If not authenticated, show landing page (will redirect to login)
  return <LandingPage />;
};

export default Index;
