import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectMembersAPI } from '../services/api';
import { Button } from './ui/Button';
import { Home, FileText, Layers, LogOut, Play, BarChart3, Package, TrendingUp } from 'lucide-react';

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [displayRole, setDisplayRole] = useState('');

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

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 cursor-pointer hover:scale-105 transition-transform"
            >
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h1
                onClick={() => navigate('/dashboard')}
                className="font-bold text-lg text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Pramana Manager
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-2">
              <Button
                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/dashboard')}
                className={isActive('/dashboard') ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : ''}
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={isActive('/test-cases') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/test-cases')}
                className={isActive('/test-cases') ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : ''}
              >
                <FileText className="mr-2 h-4 w-4" />
                Test Cases
              </Button>
              <Button
                variant={isActive('/applications') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/applications')}
                className={isActive('/applications') ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : ''}
              >
                <Package className="mr-2 h-4 w-4" />
                Applications
              </Button>
              <Button
                variant={isActive('/test-modules') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/test-modules')}
                className={isActive('/test-modules') ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' : ''}
              >
                <Layers className="mr-2 h-4 w-4" />
                Test Modules
              </Button>
              <Button
                variant={isActive('/test-runs') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/test-runs')}
                className={isActive('/test-runs') ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700' : ''}
              >
                <Play className="mr-2 h-4 w-4" />
                Test Runs
              </Button>
              <Button
                variant={isActive('/metrics') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/metrics')}
                className={isActive('/metrics') ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : ''}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Metrics
              </Button>
              <Button
                variant={isActive('/reports') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/reports')}
                className={isActive('/reports') ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' : ''}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Reports
              </Button>
            </nav>

            {/* User Profile */}
            <div className="hidden sm:flex items-center gap-3 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center ring-2 ring-blue-200 dark:ring-blue-800">
                <span className="text-blue-700 dark:text-blue-300 font-bold text-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-gray-900 dark:text-white">{user?.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{displayRole || 'User'}</p>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
