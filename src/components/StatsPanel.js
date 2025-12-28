import React from 'react';

const StatsPanel = ({ darkMode, moderatedWords, pendingWords, responses }) => {
  return (
    <div className={`mt-6 ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-6 border transition-colors duration-300`}>
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-dark-text' : 'text-gray-900'}`}>Current Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`text-center p-4 rounded-lg ${darkMode ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50'}`}>
          <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{moderatedWords.length}</div>
          <div className={`text-sm ${darkMode ? 'text-blue-300' : 'text-gray-600'}`}>Approved Words</div>
        </div>
        <div className={`text-center p-4 rounded-lg ${darkMode ? 'bg-yellow-900/30 border border-yellow-800' : 'bg-yellow-50'}`}>
          <div className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{pendingWords.length}</div>
          <div className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-gray-600'}`}>Pending Review</div>
        </div>
        <div className={`text-center p-4 rounded-lg ${darkMode ? 'bg-green-900/30 border border-green-800' : 'bg-green-50'}`}>
          <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{responses.length}</div>
          <div className={`text-sm ${darkMode ? 'text-green-300' : 'text-gray-600'}`}>Total Responses</div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;