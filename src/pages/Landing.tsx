import React from 'react';
import { LandingPage } from '@/components/LandingPage';
import { useNavigate } from 'react-router-dom';
import { SEO, SEO_CONFIGS } from '@/components/SEO';
import { getWebApplicationSchema, getOrganizationSchema } from '@/utils/structuredData';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Navigate to the main app (Index page) without showing landing
    navigate('/app');
  };

  // Combine multiple structured data schemas
  const combinedStructuredData = [
    getWebApplicationSchema(),
    getOrganizationSchema()
  ];

  return (
    <>
      <SEO
        {...SEO_CONFIGS.home}
        structuredData={combinedStructuredData}
      />
      <LandingPage onGetStarted={handleGetStarted} />
    </>
  );
};

export default Landing;
