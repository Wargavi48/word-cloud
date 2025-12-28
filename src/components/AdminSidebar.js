import React from 'react';
import {
  PanelLeftClose, PanelLeftOpen, X, Shield, ShieldOff,
  Sun, Moon, Check, RefreshCw, Trash2, Save, Lock, Unlock
} from 'lucide-react';
// Removed PasscodeOverlay import
import ApprovedWordsPanel from './ApprovedWordsPanel'; // Import ApprovedWordsPanel
import PendingWordsPanel from './PendingWordsPanel';   // Import PendingWordsPanel

const AdminSidebar = ({
  darkMode,
  showAdminPanel,
  adminSidebarOpen,
  moderationEnabled,
  systemTheme,
  adminSettings,
  tempSettings,
  setTempSettings,
  toggleAdminSidebar,
  setShowAdminPanel,
  toggleModeration,
  handleThemeChange,
  saveAdminSettings,
  updatePasscode,
  resetAll,
  pendingWords,
  approveWord,
  rejectWord,
  moderatedWords,
  removeApprovedWord,
  updateApprovedWord, // New prop
  adminAccessGranted,
  adminPasscode,
  enteredPasscode,
  setEnteredPasscode, // Correctly destructure setEnteredPasscode
  handleAdminAccess,
  handleLogout, // New prop for logout
  selectedFont, // New prop for selected font
  setSelectedFont // New prop for setting selected font
}) => {
  console.log('AdminSidebar props:', { setEnteredPasscode });
  if (!showAdminPanel) return null;

  return (
    <>
      {/* Mobile overlay, only visible if sidebar is open */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${adminSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setShowAdminPanel(false)}
      />

      {/* Sidebar */}
      <div className={`admin-sidebar fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${
        adminSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow-2xl w-full md:w-64 lg:w-96`}>
        {/* Sidebar Header */}
        <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-dark-text' : 'text-gray-900'}`}>Admin Panel</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleAdminSidebar}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              title={adminSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
            >
              {adminSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
          </div>
        </div>

        {/* Sidebar Content - only visible if adminAccessGranted is true */}
        {adminAccessGranted ? (
          <div className="h-[calc(100vh-64px)] overflow-y-auto p-4 space-y-6">
            {/* Moderation Toggle */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {moderationEnabled ? <Shield size={20} className="text-green-500" /> : <ShieldOff size={20} className="text-gray-500" />}
                  <h3 className={`font-semibold ${darkMode ? 'text-dark-text' : 'text-gray-900'}`}>Word Moderation</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={moderationEnabled}
                    onChange={toggleModeration}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                </label>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {moderationEnabled 
                  ? 'Words require manual approval before appearing in the word cloud.' 
                  : 'Words are automatically approved and appear immediately in the word cloud.'}
              </p>
            </div>

            {/* Word Moderation Panels */}
            <PendingWordsPanel
              darkMode={darkMode}
              pendingWords={pendingWords}
              approveWord={approveWord}
              rejectWord={rejectWord}
            />
            <ApprovedWordsPanel
              darkMode={darkMode}
              moderatedWords={moderatedWords}
              removeApprovedWord={removeApprovedWord}
              updateApprovedWord={updateApprovedWord} // Pass new prop
            />

            {/* Content Settings */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold mb-4 ${darkMode ? 'text-dark-text' : 'text-gray-900'}`}>Content Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Character Limit
                  </label>
                  <input
                    type="number"
                    value={tempSettings.characterLimit}
                    onChange={(e) => setTempSettings({...tempSettings, characterLimit: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-dark-text focus:border-indigo-500' 
                        : 'border border-gray-300 focus:border-indigo-500'
                    }`}
                    min="10"
                    max="500"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Excluded Words (comma-separated)
                  </label>
                  <textarea
                    value={tempSettings.excludeWords}
                    onChange={(e) => setTempSettings({...tempSettings, excludeWords: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-dark-text focus:border-indigo-500' 
                        : 'border border-gray-300 focus:border-indigo-500'
                    }`}
                    rows="3"
                    placeholder="bad, inappropriate, offensive"
                  />
                </div>
                <button
                  onClick={saveAdminSettings}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Save size={16} />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>

            {/* Font Selector */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold mb-4 ${darkMode ? 'text-dark-text' : 'text-gray-900'}`}>Font Selector</h3>
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-dark-text focus:border-indigo-500'
                    : 'border border-gray-300 focus:border-indigo-500'
                }`}
              >
                <option value="Roboto">Roboto</option>
                <option value="Lato">Lato</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Oswald">Oswald</option>
                <option value="Source Sans Pro">Source Sans Pro</option>
              </select>
            </div>

            {/* Security Settings */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold mb-4 ${darkMode ? 'text-dark-text' : 'text-gray-900'}`}>Security Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    New Admin Passcode
                  </label>
                  <input
                    type="password"
                    value={tempSettings.newPasscode || ''}
                    onChange={(e) => setTempSettings({...tempSettings, newPasscode: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-dark-text focus:border-indigo-500' 
                        : 'border border-gray-300 focus:border-indigo-500'
                    }`}
                    placeholder="Enter new passcode (min 6 chars)"
                  />
                </div>
                <button
                  onClick={updatePasscode}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Lock size={16} />
                  <span>Update Passcode</span>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
              <h3 className={`font-semibold mb-4 ${darkMode ? 'text-red-300' : 'text-red-700'}`}>Danger Zone</h3>
              <div className="space-y-3">
                <button
                  onClick={resetAll}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Reset All Data</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Unlock size={16} />
                  <span>Logout</span>
                </button>
                <button
                  onClick={() => {
                    // This would refresh the word cloud data
                    alert('Word cloud data refreshed!');
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <RefreshCw size={16} />
                  <span>Refresh Word Cloud</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-4">
            <Lock size={48} className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`text-lg mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Enter Admin Passcode</p>
            <input
              type="password"
              value={enteredPasscode}
              onChange={(e) => setEnteredPasscode(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAdminAccess();
                }
              }}
              className={`w-full max-w-xs px-4 py-2 rounded-lg text-center text-lg ${
                darkMode ? 'bg-gray-700 border-gray-600 text-dark-text' : 'border border-gray-300 text-gray-900'
              }`}
              placeholder="Passcode"
            />
            <button
              onClick={handleAdminAccess}
              className="w-full max-w-xs px-4 py-2 mt-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminSidebar;