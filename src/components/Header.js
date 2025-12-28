import React from 'react';
import { Settings, Sun, Moon } from 'lucide-react';

const Header = ({ darkMode, toggleDarkMode, onAdminPanelClick }) => {
  return (
    <header className={`${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} shadow-sm border-b transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">WC</span>
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-dark-text' : 'text-gray-900'}`}>Word Cloud Generator</h1>
              <p className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>Share your thoughts and see them visualized</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} transition-colors`}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;