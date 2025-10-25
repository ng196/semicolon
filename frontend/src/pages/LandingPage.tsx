import React, { useEffect } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { BeamBackground } from '@/components/landing/BeamBackground';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import '@/styles/landing.css';

const LandingPageContent: React.FC = () => {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* Animated Background */}
      <BeamBackground />

      {/* Navigation */}
      <LandingNavigation />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* About Section (Optional - can be added later) */}
        <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              About Saksham
            </h2>
            <p className="text-lg text-white/70 leading-relaxed">
              Saksham is a comprehensive platform designed to unify the college experience. 
              We bring together students, clubs, and academic resources in one seamless environment, 
              making campus life more connected, efficient, and enjoyable.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

const LandingPage: React.FC = () => {
  return (
    <LanguageProvider>
      <LandingPageContent />
    </LanguageProvider>
  );
};

export default LandingPage;
