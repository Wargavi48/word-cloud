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
  const [selectedFont, setSelectedFont] = useState("Roboto"); // New state for selected font
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

  // Initialize with mock data and default passcode
  useEffect(() => {
    const mockResponses = [
      {
        id: 1,
        text: "Innovation",
        status: "approved",
        timestamp: new Date(Date.now() - 86400000),
      },
      {
        id: 2,
        text: "Creativity",
        status: "approved",
        timestamp: new Date(Date.now() - 172800000),
      },
      {
        id: 3,
        text: "Technology",
        status: "approved",
        timestamp: new Date(Date.now() - 259200000),
      },
      {
        id: 4,
        text: "Collaboration",
        status: "approved",
        timestamp: new Date(Date.now() - 345600000),
      },
    ];
    const mockPending = [
      { id: 5, text: "Awesome", status: "pending", timestamp: new Date() },
      {
        id: 6,
        text: "Fantastic",
        status: "pending",
        timestamp: new Date(Date.now() - 3600000),
      },
    ];

    setResponses(mockResponses);
    setPendingWords(mockPending);
    setModeratedWords(mockResponses.filter((r) => r.status === "approved"));
    setRealtimeWords(mockResponses.filter((r) => r.status === "approved")); // Initialize realtime feed with approved words
    setAdminPasscode("admin123");
    setTempSettings({
      excludeWords: "",
      characterLimit: 50,
    });
    generateWordCloud(mockResponses.filter((r) => r.status === "approved"));

    // Load saved preferences
    const savedModeration =
      localStorage.getItem("wordCloudModeration") !== "false"; // default to true
    const savedAdminAccess =
      localStorage.getItem("adminAccessGranted") === "true"; // Load admin access

    setModerationEnabled(savedModeration);
    setAdminAccessGranted(savedAdminAccess);

    window.addEventListener("resize", handleResize);
    // Initial check
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [adminSidebarOpen, showAdminPanel]);

  // New useEffect for initial theme and admin access loading
  useEffect(() => {
    const savedModeration =
      localStorage.getItem("wordCloudModeration") !== "false";
    const savedTheme = localStorage.getItem("wordCloudTheme");
    const savedAdminAccess =
      localStorage.getItem("adminAccessGranted") === "true";

    // ThemeManager will handle handleThemeChange call
    setModerationEnabled(savedModeration);
    setAdminAccessGranted(savedAdminAccess);
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
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);

    setWordCloudData(wordArray);
  };

  const validateSubmission = (text) => {
    if (
      adminSettings.characterLimitEnabled &&
      text.length > adminSettings.characterLimit
    ) {
      return {
        valid: false,
        message: `Text exceeds ${adminSettings.characterLimit} character limit`,
      };
    }

    if (
      adminSettings.excludeWordsEnabled &&
      adminSettings.excludeWords.length > 0
    ) {
      const lowercaseText = text.toLowerCase();
      const excludedWord = adminSettings.excludeWords.find((word) =>
        lowercaseText.includes(word.toLowerCase())
      );
      if (excludedWord) {
        return {
          valid: false,
          message: `Text contains excluded word: "${excludedWord}"`,
        };
      }
    }

    return { valid: true, message: "" };
  };

  const handleSubmit = (e) => {
    // e.preventDefault(); // No longer needed as form submission is handled by onKeyPress in input
    if (!newResponse.trim()) return;

    const validation = validateSubmission(newResponse);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    const newWord = {
      id: Date.now(),
      text: newResponse.trim(),
      status: moderationEnabled ? "pending" : "approved",
      timestamp: new Date(),
    };

    if (moderationEnabled) {
      // Add to pending queue for moderation
      setPendingWords([...pendingWords, newWord]);
    } else {
      // Auto-approve when moderation is disabled
      const updatedResponses = [...responses, newWord];
      setResponses(updatedResponses);
      setModeratedWords(
        updatedResponses.filter((r) => r.status === "approved")
      );
      generateWordCloud(
        updatedResponses.filter((r) => r.status === "approved")
      );
    }

    // Always add to realtime feed, regardless of moderation status
    setRealtimeWords((prevWords) => [...prevWords, newWord]);
    setNewResponse("");
  };

  const approveWord = (wordId) => {
    const wordToApprove = pendingWords.find((w) => w.id === wordId);
    if (wordToApprove) {
      const validation = validateSubmission(wordToApprove.text);
      if (!validation.valid) {
        alert(`Cannot approve: ${validation.message}`);
        return;
      }

      const updatedResponses = [
        ...responses,
        { ...wordToApprove, status: "approved" },
      ];
      setResponses(updatedResponses);
      setModeratedWords(
        updatedResponses.filter((r) => r.status === "approved")
      );
      setPendingWords(pendingWords.filter((w) => w.id !== wordId));
      setRealtimeWords((prevWords) => [
        ...prevWords,
        { ...wordToApprove, status: "approved" },
      ]); // Add to realtime feed
      generateWordCloud(
        updatedResponses.filter((r) => r.status === "approved")
      );
    }
  };

  const rejectWord = (wordId) => {
    setPendingWords(pendingWords.filter((w) => w.id !== wordId));
  };

  const removeApprovedWord = (wordId) => {
    const updatedResponses = responses.filter((r) => r.id !== wordId);
    setResponses(updatedResponses);
    setModeratedWords(updatedResponses.filter((r) => r.status === "approved"));
    generateWordCloud(updatedResponses.filter((r) => r.status === "approved"));
  };

  const resetAll = () => {
    if (window.confirm("Are you sure you want to reset all data?")) {
      setResponses([]);
      setPendingWords([]);
      setModeratedWords([]);
      setWordCloudData([]);
      setShowWordCloud(false);
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

  const updateApprovedWord = (wordId, newText) => {
    const validation = validateSubmission(newText);
    if (!validation.valid) {
      alert(`Cannot update: ${validation.message}`);
      return;
    }

    const updatedResponses = responses.map((r) =>
      r.id === wordId ? { ...r, text: newText } : r
    );
    setResponses(updatedResponses);
    setModeratedWords(updatedResponses.filter((r) => r.status === "approved"));
    generateWordCloud(updatedResponses.filter((r) => r.status === "approved"));
  };

  const handleAdminAccess = () => {
    if (enteredPasscode === adminPasscode) {
      setAdminAccessGranted(true);
      setShowAdminPanel(true); // Open admin panel after successful login
      // Save admin access granted state to localStorage
      localStorage.setItem("adminAccessGranted", "true");
    } else {
      alert("Incorrect passcode.");
      setEnteredPasscode("");
    }
  };

  const saveAdminSettings = () => {
    const excludeWordsArray = tempSettings.excludeWords
      .split(",")
      .map((word) => word.trim())
      .filter((word) => word.length > 0);

    setAdminSettings({
      ...adminSettings,
      excludeWords: excludeWordsArray,
      characterLimit: parseInt(tempSettings.characterLimit) || 50,
    });
    alert("Settings saved successfully!");
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

  const toggleModeration = () => {
    const newModeration = !moderationEnabled;
    setModerationEnabled(newModeration);
    localStorage.setItem("wordCloudModeration", newModeration.toString());

    if (!newModeration && pendingWords.length > 0) {
      // Auto-approve all pending words when turning moderation off
      const updatedResponses = [
        ...responses,
        ...pendingWords.map((w) => ({ ...w, status: "approved" })),
      ];
      setResponses(updatedResponses);
      setModeratedWords(
        updatedResponses.filter((r) => r.status === "approved")
      );
      setPendingWords([]);
      generateWordCloud(
        updatedResponses.filter((r) => r.status === "approved")
      );
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
