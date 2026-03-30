import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectMembersAPI } from '../services/api';
import { Button } from './ui/Button';
import { Home, FileText, Layers, LogOut, Play, BarChart3, Package, TrendingUp, Menu, X, KeyRound, ChevronDown, BookOpen } from 'lucide-react';

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [displayRole, setDisplayRole] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const determineRole = async () => {
      if (!user) return;

      // Admin users always show ADMIN
      if (user.role === 'ADMIN') {
        setDisplayRole('Admin');
        return;
      }

      // For regular users, check their project memberships
      try {
        const response = await projectMembersAPI.getUserProjects(user.id);
        const memberships = response.data;

        if (memberships.length === 0) {
          setDisplayRole('User');
          return;
        }

        // Check if user is LEAD in any project
        const hasLeadRole = memberships.some(m => m.role === 'LEAD');
        if (hasLeadRole) {
          setDisplayRole('Lead');
        } else {
          setDisplayRole('User');
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        setDisplayRole('User');
      }
    };

    determineRole();
  }, [user]);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard', gradient: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' },
    { path: '/metrics', icon: TrendingUp, label: 'Metrics', gradient: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
    { path: '/applications', icon: Package, label: 'Applications', gradient: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
    { path: '/test-modules', icon: Layers, label: 'Modules', gradient: 'from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
    { path: '/test-cases', icon: FileText, label: 'Test Cases', gradient: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' },
    { path: '/test-runs', icon: Play, label: 'Test Runs', gradient: 'from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700' },
    { path: '/reports', icon: BarChart3, label: 'Reports', gradient: 'from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' }
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 cursor-pointer hover:scale-105 transition-transform"
            >
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <h1
              onClick={() => navigate('/dashboard')}
              className="font-bold text-base sm:text-lg text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors hidden sm:block"
            >
              Testrium
            </h1>
          </div>

          {/* Desktop/Tablet Navigation - Text Only */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center mx-4 overflow-x-auto">
            {navItems.map(({ path, label, gradient }) => (
              <Button
                key={path}
                variant={isActive(path) ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleNavClick(path)}
                className={`${isActive(path) ? `bg-gradient-to-r ${gradient}` : ''} whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3`}
              >
                {label}
              </Button>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* User Dropdown */}
            <div className="hidden md:block relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center ring-2 ring-blue-200 dark:ring-blue-800">
                  <span className="text-blue-700 dark:text-blue-300 font-bold text-xs">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-xs hidden lg:block text-left">
                  <p className="font-semibold text-gray-900 dark:text-white leading-tight">{user?.username}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{displayRole || 'User'}</p>
                </div>
                <ChevronDown className="h-3 w-3 text-gray-500 hidden lg:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate('/help'); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <BookOpen className="h-4 w-4 text-green-500" />
                    Help & Guide
                  </button>
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate('/change-password'); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <KeyRound className="h-4 w-4 text-blue-500" />
                    Change Password
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-700" />
                  <button
                    onClick={() => { setUserMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4 space-y-2 animate-in slide-in-from-top">
            {navItems.map(({ path, icon: Icon, label, gradient }) => (
              <button
                key={path}
                onClick={() => handleNavClick(path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(path)
                    ? 'bg-gradient-to-r ' + gradient + ' text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </button>
            ))}

            {/* Mobile User Info */}
            <div className="px-4 py-3 mt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center ring-2 ring-blue-200 dark:ring-blue-800">
                  <span className="text-blue-700 dark:text-blue-300 font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{user?.username}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{displayRole || 'User'}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => { setMobileMenuOpen(false); navigate('/help'); }}
                className="w-full justify-center mb-2"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Help & Guide
              </Button>
              <Button
                variant="outline"
                onClick={() => { setMobileMenuOpen(false); navigate('/change-password'); }}
                className="w-full justify-center mb-2"
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Change Password
              </Button>
              <Button
                variant="outline"
                onClick={logout}
                className="w-full justify-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
