import React from 'react';
import { Github, Mail, Globe } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Side - Branding */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-gray-900 dark:text-white">Testrium</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Test Case Management System</p>
            </div>
          </div>

          {/* Center - Copyright */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} Testrium. All rights reserved.
          </div>

          {/* Right Side - Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="mailto:support@testrium.com"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Email Support"
            >
              <Mail className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Website"
            >
              <Globe className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
