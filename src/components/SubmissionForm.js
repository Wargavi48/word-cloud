import React from 'react';
import { Send } from 'lucide-react';

const SubmissionForm = ({
  darkMode,
  newResponse,
  setNewResponse,
  handleSubmit,
  adminSettings
}) => {
  return (
    <div className={`${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-6 border transition-colors duration-300`}>
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-dark-text' : 'text-gray-900'}`}>Share Your Word</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={newResponse}
            onChange={(e) => setNewResponse(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { // Submit on Enter, prevent Shift+Enter
                e.preventDefault(); // Prevent new line on Enter
                handleSubmit(e); // Pass the event to handleSubmit
              }
            }}
            placeholder="Enter your word or phrase..."
            className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 text-dark-text placeholder-gray-500 focus:border-indigo-500' 
                : 'border border-gray-300 focus:border-indigo-500'
            }`}
            maxLength={adminSettings.characterLimitEnabled ? adminSettings.characterLimit : 1000}
          />
          {adminSettings.characterLimitEnabled && (
            <p className={`text-sm mt-1 text-right ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {newResponse.length}/{adminSettings.characterLimit} characters
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default SubmissionForm;
