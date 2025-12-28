import React, { useState } from 'react';
import { Trash2, Check, Pencil } from 'lucide-react';

const ApprovedWordsPanel = ({
  darkMode,
  moderatedWords,
  removeApprovedWord,
  updateApprovedWord // New prop for updating words
}) => {
  const [editingWordId, setEditingWordId] = useState(null);
  const [editedWordText, setEditedWordText] = useState('');
  if (moderatedWords.length === 0) return null;

  return (
    <div className={`mt-6 ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-6 border transition-colors duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-dark-text' : 'text-gray-900'}`}>
          Approved Words
        </h3>
        <div className="flex items-center space-x-2">
          <Check size={18} className={darkMode ? 'text-green-400' : 'text-green-600'} />
          <span className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
            {moderatedWords.length} approved
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {moderatedWords.map((word) => (
          <div
            key={word.id}
            className={`flex items-center justify-between p-3 rounded-lg ${
              darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-green-50 hover:bg-green-100'
            } transition-colors group`}
          >
            {editingWordId === word.id ? (
              <input
                type="text"
                value={editedWordText}
                onChange={(e) => setEditedWordText(e.target.value)}
                className={`flex-1 mr-2 p-1 rounded ${
                  darkMode ? 'bg-gray-700 text-dark-text' : 'bg-white text-gray-900'
                } border ${darkMode ? 'border-dark-border' : 'border-gray-300'}`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    updateApprovedWord(word.id, editedWordText);
                    setEditingWordId(null);
                  }
                }}
              />
            ) : (
              <div className="flex-1">
                <p className={`font-medium ${darkMode ? 'text-dark-text' : 'text-gray-900'}`}>
                  {word.text}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {new Date(word.timestamp).toLocaleDateString()}
                </p>
              </div>
            )}
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all">
              {editingWordId === word.id ? (
                <button
                  onClick={() => {
                    updateApprovedWord(word.id, editedWordText);
                    setEditingWordId(null);
                  }}
                  className={`p-2 rounded-lg ${
                    darkMode ? 'text-green-400 hover:bg-green-900/30' : 'text-green-600 hover:bg-green-100'
                  }`}
                  title="Save changes"
                >
                  <Check size={16} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingWordId(word.id);
                    setEditedWordText(word.text);
                  }}
                  className={`p-2 rounded-lg ${
                    darkMode ? 'text-blue-400 hover:bg-blue-900/30' : 'text-blue-600 hover:bg-blue-100'
                  }`}
                  title="Edit word"
                >
                  <Pencil size={16} />
                </button>
              )}
              <button
                onClick={() => removeApprovedWord(word.id)}
                className={`p-2 rounded-lg ${
                  darkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-100'
                }`}
                title="Remove word"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApprovedWordsPanel;