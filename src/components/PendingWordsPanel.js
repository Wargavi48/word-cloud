import React from 'react';
import { Check, X, Clock } from 'lucide-react';

const PendingWordsPanel = ({ 
  darkMode, 
  pendingWords, 
  approveWord, 
  rejectWord 
}) => {
  if (pendingWords.length === 0) return null;

  return (
    <div className={`mt-6 ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-6 border transition-colors duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-dark-text' : 'text-gray-900'}`}>
          Pending Words for Approval
        </h3>
        <div className="flex items-center space-x-2">
          <Clock size={18} className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} />
          <span className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
            {pendingWords.length} pending
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        {pendingWords.map((word) => (
          <div 
            key={word.id} 
            className={`flex items-center justify-between p-4 rounded-lg ${
              darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-yellow-50 hover:bg-yellow-100'
            } transition-colors`}
          >
            <div className="flex-1">
              <p className={`font-medium ${darkMode ? 'text-dark-text' : 'text-gray-900'}`}>
                {word.text}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Submitted: {new Date(word.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => approveWord(word.id)}
                className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title="Approve"
              >
                <Check size={16} />
                <span className="hidden sm:inline">Approve</span>
              </button>
              <button
                onClick={() => rejectWord(word.id)}
                className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                title="Reject"
              >
                <X size={16} />
                <span className="hidden sm:inline">Reject</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingWordsPanel;