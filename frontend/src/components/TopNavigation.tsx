import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { ProfileMenu } from '@/components/ProfileMenu';

export const TopNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Hubs', path: '/hubs' },
    { label: 'Events', path: '/events' },
    { label: 'Marketplace', path: '/marketplace' },
    { label: 'Network', path: '/network' },
    { label: 'Requests', path: '/requests' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Saksham
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`text-sm font-medium transition-all duration-200 relative ${
                  isActive(item.path)
                    ? 'text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-indigo-600"></span>
                )}
              </button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-all">
              <Bell className="h-5 w-5" />
            </button>
            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
