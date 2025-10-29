import React from 'react';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { Instagram, Linkedin, Facebook, Youtube, Twitter, Mail, Phone } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  const { t } = useLanguage();

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  ];

  const pageLinks = [
    { key: 'footer.about', href: '#about' },
    { key: 'footer.marketplace', href: '#marketplace' },
    { key: 'footer.plans', href: '#plans' },
    { key: 'footer.contact', href: '#contact' },
    { key: 'footer.support', href: '#support' },
  ];

  const policyLinks = [
    { key: 'footer.terms', href: '#terms' },
    { key: 'footer.privacy', href: '#privacy' },
    { key: 'footer.refund', href: '#refund' },
  ];

  return (
    <footer className="bg-black/40 border-t border-white/10 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Saksham</h3>
            <p className="text-white/60">{t('footer.tagline')}</p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-indigo-400 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Pages Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              {t('footer.pages')}
            </h4>
            <ul className="space-y-2">
              {pageLinks.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Policy Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              {t('footer.policies')}
            </h4>
            <ul className="space-y-2">
              {policyLinks.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              {t('footer.contact')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-white/60">
                <Mail className="w-4 h-4" />
                <a
                  href="mailto:support@saksham.edu"
                  className="hover:text-white transition-colors"
                >
                  support@saksham.edu
                </a>
              </li>
              <li className="flex items-center space-x-2 text-white/60">
                <Phone className="w-4 h-4" />
                <a
                  href="tel:+911234567890"
                  className="hover:text-white transition-colors"
                >
                  +91-1234-567890
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-white/60">
          <p>&copy; {new Date().getFullYear()} Saksham. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
