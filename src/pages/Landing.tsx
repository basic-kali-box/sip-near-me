import React from 'react';
import { LandingPage } from '@/components/LandingPage';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Navigate to the main app (Index page) without showing landing
    navigate('/app');
  };

  return <LandingPage onGetStarted={handleGetStarted} />;
};

export default Landing;
