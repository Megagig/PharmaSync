import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import LandingHeader from './components/LandingHeader';
import LandingFooter from './components/LandingFooter';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import FaqSection from './components/FaqSection';
import TestimonialsSection from './components/TestimonialsSection';

const LandingPage = () => {
  // Set page title on component mount
  useEffect(() => {
    document.title = 'PharmaSync - Pharmaceutical Care App';
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <AboutSection />
        <TestimonialsSection />
        <FaqSection />
        <ContactSection />
      </main>
      
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
