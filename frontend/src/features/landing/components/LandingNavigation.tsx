import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { Menu, X } from 'lucide-react';

export const LandingNavigation: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/auth/login');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-black/80 backdrop-blur-lg shadow-lg border-b border-white/10'
          : 'bg-transparent'
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => scrollToSection('top')}
              className="text-2xl font-bold text-white hover:text-indigo-400 transition-colors"
            >
              Saksham
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('top')}
              className="text-white/80 hover:text-white transition-colors"
            >
              {t('nav.home')}
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-white/80 hover:text-white transition-colors"
            >
              {t('nav.about')}
            </button>
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={setLanguage}
            />
            <Button
              onClick={handleLoginClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {t('nav.login')}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={setLanguage}
            />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection('top')}
                className="text-white/80 hover:text-white transition-colors text-left px-4 py-2"
              >
                {t('nav.home')}
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-white/80 hover:text-white transition-colors text-left px-4 py-2"
              >
                {t('nav.about')}
              </button>
              <div className="px-4">
                <Button
                  onClick={handleLoginClick}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {t('nav.login')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
