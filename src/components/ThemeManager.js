import React, { useState, useEffect, useCallback } from 'react';

const ThemeManager = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [systemTheme, setSystemTheme] = useState('light');

  // Media query for system theme detection
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  // Memoized callback for handling system theme changes
  const handleSystemThemeChange = useCallback((e) => {
    setSystemTheme(e.matches ? 'dark' : 'light');
    // Only update darkMode if the current preference is 'system'
    if (localStorage.getItem('wordCloudTheme') === 'system') {
      setDarkMode(e.matches);
    }
  }, []);

  // Initial theme loading and system theme listener setup
  useEffect(() => {
    const savedTheme = localStorage.getItem('wordCloudTheme');
    const initialSystemTheme = mediaQuery.matches ? 'dark' : 'light';
    setSystemTheme(initialSystemTheme);

    if (savedTheme === 'system' || !savedTheme) {
      setDarkMode(initialSystemTheme === 'dark');
    } else {
      setDarkMode(savedTheme === 'dark');
    }

    // Add listener for system theme changes
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [handleSystemThemeChange, mediaQuery]); // mediaQuery is a stable object, handleSystemThemeChange is memoized

  // Public function to change theme (called by Header or AdminSidebar)
  const handleThemeChange = useCallback((theme) => {
    if (theme === 'system') {
      setDarkMode(mediaQuery.matches);
    } else {
      setDarkMode(theme === 'dark');
    }
    localStorage.setItem('wordCloudTheme', theme);
  }, [mediaQuery.matches]);

  // Public function to toggle dark mode (used by Header)
  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    const newThemePreference = newDarkMode ? 'dark' : 'light';
    localStorage.setItem('wordCloudTheme', newThemePreference);
  }, [darkMode]);

  return children({ darkMode, toggleDarkMode, handleThemeChange, systemTheme });
};

export default ThemeManager;
