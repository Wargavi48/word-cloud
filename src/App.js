import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas"; // Import html2canvas
import AdminSidebar from "./components/AdminSidebar";
import RealtimeWordFeed from "./components/RealtimeWordFeed";
import WordCloudVisualization from "./components/WordCloudVisualization";
import Header from "./components/Header";
import SubmissionForm from "./components/SubmissionForm"; // Import SubmissionForm
import ThemeManager from "./components/ThemeManager";
import {
  Send,
  Eye,
  EyeOff,
  Trash2,
  Check,
  X,
  RefreshCw,
  Settings,
  Lock,
  Unlock,
  Maximize2,
  Download,
  Minimize2,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Filter,
  Shield,
  ShieldOff,
  Menu,
  XCircle,
  Save,
  Clock,
  Users,
  BarChart,
  Hash,
  MessageSquare,
} from "lucide-react";

const App = () => {
  const [responses, setResponses] = useState([]);
  const [moderatedWords, setModeratedWords] = useState([]);
  const [newResponse, setNewResponse] = useState("");
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminAccessGranted, setAdminAccessGranted] = useState(false);
  const [pendingWords, setPendingWords] = useState([]);
  const [wordCloudData, setWordCloudData] = useState([]);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [enteredPasscode, setEnteredPasscode] = useState("");
  const [adminSettings, setAdminSettings] = useState({
    excludeWords: [],
    characterLimit: 50,
    excludeWordsEnabled: false,
    characterLimitEnabled: true,
  });
  const [tempSettings, setTempSettings] = useState({
    excludeWords: "",
    characterLimit: 50,
  });
  const [showWordCloud, setShowWordCloud] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [moderationEnabled, setModerationEnabled] = useState(true);
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(false); // Changed default to false for mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [showRealtimeFeed, setShowRealtimeFeed] = useState(false);
  const [isFeedFullScreen, setIsFeedFullScreen] = useState(false);
  const [realtimeWords, setRealtimeWords] = useState([]);
  const [selectedFont, setSelectedFont] = useState("Oswald"); // New state for selected font
  const wordCloudRef = useRef(null);
  const realtimeFeedRef = useRef(null);
  const wordCloudCaptureRef = useRef(null); // New ref for capturing word cloud area

  // Handle window resize for responsive behavior
  const handleResize = () => {
    setIsDesktop(window.innerWidth >= 1024);
    // On desktop view, always show expanded sidebar when admin panel is open, but only if it's not already open
    if (window.innerWidth >= 1024 && showAdminPanel && !adminSidebarOpen) {
      setAdminSidebarOpen(true);
    }
  };

  // Fetch data from backend on initial load
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all words
        const wordsResponse = await fetch('/api/words');
        const allWords = await wordsResponse.json();

        // Separate words by status
        const responses = allWords;
        const pendingWords = allWords.filter(w => w.status === 'pending');
        const moderatedWords = allWords.filter(w => w.status === 'approved');

        setResponses(responses);
        setPendingWords(pendingWords);
        setModeratedWords(moderatedWords);
        setRealtimeWords(moderatedWords); // Initialize realtime feed with approved words

        // Generate word cloud from approved words
        generateWordCloud(moderatedWords);

        // Fetch admin settings
        const settingsResponse = await fetch('/api/settings');
        const settings = await settingsResponse.json();

        setAdminSettings({
          excludeWords: settings.exclude_words ? settings.exclude_words.split(',') : [],
          characterLimit: settings.character_limit,
          excludeWordsEnabled: settings.exclude_words_enabled === 1,
          characterLimitEnabled: settings.character_limit_enabled === 1,
          moderationEnabled: settings.moderation_enabled === 1,
        });

        setModerationEnabled(settings.moderation_enabled === 1);
        setTempSettings(prev => ({
          ...prev,
          excludeWords: settings.exclude_words || "",
          characterLimit: settings.character_limit,
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    window.addEventListener("resize", handleResize);
    // Initial check
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // New useEffect for initial theme loading
  useEffect(() => {
    const savedModeration =
      localStorage.getItem("wordCloudModeration") !== "false";
    const savedTheme = localStorage.getItem("wordCloudTheme");

    // ThemeManager will handle handleThemeChange call
    setModerationEnabled(savedModeration);
  }, []); // Empty dependency array means this runs once on mount

  const generateWordCloud = (approvedWords) => {
    const wordFrequency = {};
    approvedWords.forEach((response) => {
      const words = response.text.toLowerCase().split(/\s+/);
      words.forEach((word) => {
        if (word.trim()) {
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        }
      });
    });

    const wordArray = Object.entries(wordFrequency)
      .map(([word, count]) => ({
        word,
        count: 1 + (count - 1) * 0.1, // Addition: starts at 1, adds 0.1 for each additional occurrence after the first
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);

    setWordCloudData(wordArray);
  };

  const validateSubmission = async (text) => {
    // Fetch current settings from backend
    try {
      const settingsResponse = await fetch('/api/settings');
      const settings = await settingsResponse.json();

      if (settings.character_limit_enabled && text.length > settings.character_limit) {
        return {
          valid: false,
          message: `Text exceeds ${settings.character_limit} character limit`,
        };
      }

      if (settings.exclude_words_enabled && settings.exclude_words) {
        const excludeWords = settings.exclude_words.split(',').map(word => word.trim().toLowerCase());
        const lowercaseText = text.toLowerCase();
        const excludedWord = excludeWords.find(word => lowercaseText.includes(word));
        if (excludedWord) {
          return {
            valid: false,
            message: `Text contains excluded word: "${excludedWord}"`,
          };
        }
      }
    } catch (error) {
      console.error('Error validating submission:', error);
    }

    return { valid: true, message: "" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newResponse.trim()) return;

    const validation = await validateSubmission(newResponse);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newResponse.trim() }),
      });

      if (response.ok) {
        const newWord = await response.json();

        // Update local state
        setResponses(prev => [...prev, newWord]);

        // If moderation is enabled, add to pending words; otherwise, add to moderated words
        if (moderationEnabled) {
          setPendingWords(prev => [...prev, newWord]);
        } else {
          setModeratedWords(prev => [...prev, newWord]);
          setRealtimeWords(prev => [...prev, newWord]);
          generateWordCloud([...moderatedWords, newWord]);
        }

        setNewResponse("");
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit word');
      }
    } catch (error) {
      console.error('Error submitting word:', error);
      alert('Network error. Please try again.');
    }
  };

  const approveWord = async (wordId) => {
    try {
      const response = await fetch(`/api/words/${wordId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (response.ok) {
        // Update local state
        const wordToApprove = pendingWords.find(w => w.id === wordId);
        if (wordToApprove) {
          const updatedWord = { ...wordToApprove, status: 'approved' };

          setResponses(prev => prev.map(r => r.id === wordId ? updatedWord : r));
          setPendingWords(prev => prev.filter(w => w.id !== wordId));
          setModeratedWords(prev => [...prev, updatedWord]);
          setRealtimeWords(prev => [...prev, updatedWord]);
          generateWordCloud([...moderatedWords, updatedWord]);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to approve word');
      }
    } catch (error) {
      console.error('Error approving word:', error);
      alert('Network error. Please try again.');
    }
  };

  const rejectWord = async (wordId) => {
    try {
      const response = await fetch(`/api/words/${wordId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update local state
        setPendingWords(prev => prev.filter(w => w.id !== wordId));
        setResponses(prev => prev.filter(r => r.id !== wordId));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to reject word');
      }
    } catch (error) {
      console.error('Error rejecting word:', error);
      alert('Network error. Please try again.');
    }
  };

  const removeApprovedWord = async (wordId) => {
    try {
      const response = await fetch(`/api/words/${wordId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update local state
        setResponses(prev => prev.filter(r => r.id !== wordId));
        setModeratedWords(prev => prev.filter(r => r.id !== wordId));
        generateWordCloud(moderatedWords.filter(r => r.id !== wordId));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to remove word');
      }
    } catch (error) {
      console.error('Error removing word:', error);
      alert('Network error. Please try again.');
    }
  };

  const resetAll = async () => {
    if (window.confirm("Are you sure you want to reset all data? This cannot be undone.")) {
      try {
        const response = await fetch('/api/words', {
          method: 'DELETE',
        });

        if (response.ok) {
          setResponses([]);
          setPendingWords([]);
          setModeratedWords([]);
          setWordCloudData([]);
          setRealtimeWords([]);
          setShowWordCloud(false);
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to reset data');
        }
      } catch (error) {
        console.error('Error resetting data:', error);
        alert('Network error. Please try again.');
      }
    }
  };

  const onAdminPanelClick = () => {
    setShowAdminPanel(true);
    setAdminSidebarOpen(true);
  };

  const handleLogout = () => {
    setAdminAccessGranted(false);
    localStorage.removeItem("adminAccessGranted");
    setShowAdminPanel(false);
    setAdminSidebarOpen(false);
  };

  const updateApprovedWord = async (wordId, newText) => {
    const validation = await validateSubmission(newText);
    if (!validation.valid) {
      alert(`Cannot update: ${validation.message}`);
      return;
    }

    // For now, we'll just update the local state since we don't have an endpoint to update the word text
    // In a real implementation, you'd need a PUT endpoint for updating word text
    const updatedResponses = responses.map(r =>
      r.id === wordId ? { ...r, text: newText } : r
    );

    setResponses(updatedResponses);
    setModeratedWords(updatedResponses.filter(r => r.status === 'approved'));
    generateWordCloud(updatedResponses.filter(r => r.status === 'approved'));
  };

  const handleAdminAccess = async () => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin', // Using default admin username
          password: enteredPasscode
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAdminAccessGranted(true);
        setShowAdminPanel(true); // Open admin panel after successful login
      } else {
        const error = await response.json();
        alert(error.error || 'Incorrect passcode.');
        setEnteredPasscode("");
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Network error. Please try again.');
    }
  };

  const saveAdminSettings = async () => {
    const excludeWordsArray = tempSettings.excludeWords
      .split(",")
      .map((word) => word.trim())
      .filter((word) => word.length > 0);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          excludeWords: excludeWordsArray,
          characterLimit: parseInt(tempSettings.characterLimit) || 50,
          excludeWordsEnabled: adminSettings.excludeWordsEnabled,
          characterLimitEnabled: adminSettings.characterLimitEnabled,
          moderationEnabled: moderationEnabled,
        }),
      });

      if (response.ok) {
        setAdminSettings({
          ...adminSettings,
          excludeWords: excludeWordsArray,
          characterLimit: parseInt(tempSettings.characterLimit) || 50,
        });
        alert("Settings saved successfully!");
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Network error. Please try again.');
    }
  };

  const updatePasscode = () => {
    if (tempSettings.newPasscode && tempSettings.newPasscode.length >= 6) {
      setAdminPasscode(tempSettings.newPasscode);
      setTempSettings({ ...tempSettings, newPasscode: "" });
      alert("Passcode updated successfully!");
    } else {
      alert("Passcode must be at least 6 characters long");
    }
  };

  const toggleModeration = async () => {
    const newModeration = !moderationEnabled;
    setModerationEnabled(newModeration);
    localStorage.setItem("wordCloudModeration", newModeration.toString());

    // Update settings in backend
    try {
      const settingsResponse = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...adminSettings,
          excludeWords: adminSettings.excludeWords,
          characterLimit: adminSettings.characterLimit,
          excludeWordsEnabled: adminSettings.excludeWordsEnabled,
          characterLimitEnabled: adminSettings.characterLimitEnabled,
          moderationEnabled: newModeration,
        }),
      });

      if (settingsResponse.ok) {
        if (!newModeration && pendingWords.length > 0) {
          // Auto-approve all pending words when turning moderation off
          for (const word of pendingWords) {
            await fetch(`/api/words/${word.id}/status`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: 'approved' }),
            });
          }

          const updatedResponses = [
            ...responses,
            ...pendingWords.map(w => ({ ...w, status: 'approved' }))
          ];

          setResponses(updatedResponses);
          setModeratedWords([
            ...moderatedWords,
            ...pendingWords.map(w => ({ ...w, status: 'approved' }))
          ]);
          setPendingWords([]);
          generateWordCloud([
            ...moderatedWords,
            ...pendingWords.map(w => ({ ...w, status: 'approved' }))
          ]);
        }
      }
    } catch (error) {
      console.error('Error updating moderation settings:', error);
    }
  };

  const toggleAdminSidebar = () => {
    setAdminSidebarOpen((prevState) => {
      // If closing the sidebar, also close the admin panel (which hides the overlay)
      if (prevState) {
        setShowAdminPanel(false);
      }
      return !prevState;
    });
  };

  const toggleFullScreen = (forceState = undefined) => {
    if (typeof forceState === "boolean") {
      setIsFullScreen(forceState);
      if (!forceState) {
        setShowWordCloud(false); // Hide word cloud when exiting fullscreen
      }
    } else {
      setIsFullScreen((prev) => !prev);
    }
  };

  const toggleWordCloud = () => {
    setShowWordCloud((prev) => {
      const newState = !prev;
      setIsFullScreen(newState); // Set fullscreen based on showWordCloud state
      return newState;
    });
  };

  return (
    <ThemeManager>
      {({ darkMode, toggleDarkMode, handleThemeChange, systemTheme }) => {
        // ✅ Define functions that depend on darkMode here
        const saveAsImage = () => {
          if (wordCloudRef.current) {
            html2canvas(wordCloudRef.current, {
              backgroundColor: darkMode ? "#1a202c" : "#ffffff",
              useCORS: true,
            }).then((canvas) => {
              const link = document.createElement("a");
              link.download = "word-cloud.png";
              link.href = canvas.toDataURL("image/png");
              link.click();
            });
          }
        };

        const toggleFeedFullScreen = (forceState = undefined) => {
          if (typeof forceState === "boolean") {
            setIsFeedFullScreen(forceState);
            if (!forceState) setShowRealtimeFeed(false);
          } else {
            setIsFeedFullScreen((prev) => !prev);
          }
        };

        const saveFeedAsImage = () => {
          if (realtimeFeedRef.current) {
            html2canvas(realtimeFeedRef.current, {
              backgroundColor: darkMode ? "#1a202c" : "#ffffff",
              useCORS: true,
            }).then((canvas) => {
              const link = document.createElement("a");
              link.download = "realtime-feed.png";
              link.href = canvas.toDataURL("image/png");
              link.click();
            });
          }
        };

        return (
          <div
            className={`min-h-screen transition-colors duration-300 ${
              darkMode
                ? "dark bg-dark-bg text-dark-text"
                : "bg-gradient-to-br from-blue-50 to-indigo-100"
            }`}
          >
            {/* Floating Admin Toggler */}
            <button
              onClick={() => {
                setShowAdminPanel(true);
                setAdminSidebarOpen(true);
              }}
              className={`fixed left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full shadow-lg 
              ${
                darkMode
                  ? "bg-indigo-700 hover:bg-indigo-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }
              transition-all duration-300 transform 
              ${adminSidebarOpen ? "-translate-x-full" : "translate-x-0"}
            `}
              title="Open Admin Panel"
            >
              <Settings size={24} />
            </button>

            {/* Main layout container */}
            <div
              className={`transition-all duration-300 ${
                adminSidebarOpen && isDesktop ? "lg:ml-96" : ""
              }`}
            >
              <Header
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                onAdminPanelClick={onAdminPanelClick}
              />

              {/* Main Content */}
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <SubmissionForm
                  darkMode={darkMode}
                  newResponse={newResponse}
                  setNewResponse={setNewResponse}
                  handleSubmit={handleSubmit}
                  adminSettings={adminSettings}
                />

                {/* Stats */}
                <div
                  className={`mt-6 ${
                    darkMode
                      ? "bg-dark-card border-dark-border"
                      : "bg-white border-gray-200"
                  } rounded-xl shadow-lg p-6 border transition-colors duration-300`}
                >
                  <h3
                    className={`text-lg font-semibold mb-4 ${
                      darkMode ? "text-dark-text" : "text-gray-900"
                    }`}
                  >
                    Current Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      className={`text-center p-4 rounded-lg ${
                        darkMode
                          ? "bg-blue-900/30 border border-blue-800"
                          : "bg-blue-50"
                      }`}
                    >
                      <div
                        className={`text-2xl font-bold ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      >
                        {moderatedWords.length}
                      </div>
                      <div
                        className={`text-sm ${
                          darkMode ? "text-blue-300" : "text-gray-600"
                        }`}
                      >
                        Approved Words
                      </div>
                    </div>
                    <div
                      className={`text-center p-4 rounded-lg ${
                        darkMode
                          ? "bg-yellow-900/30 border border-yellow-800"
                          : "bg-yellow-50"
                      }`}
                    >
                      <div
                        className={`text-2xl font-bold ${
                          darkMode ? "text-yellow-400" : "text-yellow-600"
                        }`}
                      >
                        {pendingWords.length}
                      </div>
                      <div
                        className={`text-sm ${
                          darkMode ? "text-yellow-300" : "text-gray-600"
                        }`}
                      >
                        Pending Review
                      </div>
                    </div>
                    <div
                      className={`text-center p-4 rounded-lg ${
                        darkMode
                          ? "bg-green-900/30 border border-green-800"
                          : "bg-green-50"
                      }`}
                    >
                      <div
                        className={`text-2xl font-bold ${
                          darkMode ? "text-green-600" : "text-green-600"
                        }`}
                      >
                        {responses.length}
                      </div>
                      <div
                        className={`text-sm ${
                          darkMode ? "text-green-300" : "text-gray-600"
                        }`}
                      >
                        Total Responses
                      </div>
                    </div>
                  </div>
                </div>

                {/* Word Cloud */}
                <div
                  className={`mt-6 ${
                    darkMode
                      ? "bg-dark-card border-dark-border"
                      : "bg-white border-gray-200"
                  } rounded-xl shadow-lg p-6 border transition-colors duration-300`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={`text-lg font-semibold ${
                        darkMode ? "text-dark-text" : "text-gray-900"
                      }`}
                    >
                      Word Cloud Visualization
                    </h3>
                    <button
                      onClick={toggleWordCloud}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {showWordCloud ? <EyeOff size={16} /> : <Eye size={16} />}
                      <span>
                        {showWordCloud ? "Hide Word Cloud" : "Show Word Cloud"}
                      </span>
                    </button>
                  </div>
                  {showWordCloud && (
                    <WordCloudVisualization
                      wordCloudData={wordCloudData}
                      isFullScreen={isFullScreen}
                      toggleFullScreen={toggleFullScreen}
                      saveAsImage={saveAsImage}
                      darkMode={darkMode}
                      wordCloudRef={wordCloudRef}
                      wordCloudCaptureRef={wordCloudCaptureRef}
                      selectedFont={selectedFont}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Admin Sidebar */}
            <AdminSidebar
              darkMode={darkMode}
              showAdminPanel={showAdminPanel}
              adminSidebarOpen={adminSidebarOpen}
              moderationEnabled={moderationEnabled}
              systemTheme={systemTheme}
              adminSettings={adminSettings}
              tempSettings={tempSettings}
              setTempSettings={setTempSettings}
              toggleAdminSidebar={toggleAdminSidebar}
              setShowAdminPanel={setShowAdminPanel}
              toggleModeration={toggleModeration}
              handleThemeChange={handleThemeChange}
              saveAdminSettings={saveAdminSettings}
              updatePasscode={updatePasscode}
              resetAll={resetAll}
              pendingWords={pendingWords}
              approveWord={approveWord}
              rejectWord={rejectWord}
              moderatedWords={moderatedWords}
              removeApprovedWord={removeApprovedWord}
              updateApprovedWord={updateApprovedWord}
              handleLogout={handleLogout}
              adminAccessGranted={adminAccessGranted}
              adminPasscode={adminPasscode}
              enteredPasscode={enteredPasscode}
              setEnteredPasscode={setEnteredPasscode}
              handleAdminAccess={handleAdminAccess}
              selectedFont={selectedFont}
              setSelectedFont={setSelectedFont}
            />

            {/* Realtime Feed */}
            {showRealtimeFeed && (
              <RealtimeWordFeed
                feedRef={realtimeFeedRef}
                showRealtimeFeed={showRealtimeFeed}
                setShowRealtimeFeed={setShowRealtimeFeed}
                realtimeWords={realtimeWords}
                isFeedFullScreen={isFeedFullScreen}
                toggleFeedFullScreen={toggleFeedFullScreen}
                saveFeedAsImage={saveFeedAsImage}
                darkMode={darkMode}
              />
            )}
          </div>
        );
      }}
    </ThemeManager>
  );
};

export default App;
