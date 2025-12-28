import React, { useState, useEffect, useRef } from 'react';
import ReactWordcloud from 'react-wordcloud';
import { Maximize2, Download, X, Minimize2 } from 'lucide-react';

const WordCloudVisualization = ({ 
  darkMode, 
  wordCloudData, 
  wordCloudRef, 
  toggleFullScreen, 
  saveAsImage,
  isFullScreen,
  selectedFont
}) => {
  const [size, setSize] = useState([600, 400]);
  const containerRef = useRef();

  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setSize([width, height]);
      }
    }
    window.addEventListener('resize', updateSize);
    updateSize(); // Initial size
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const colors = ["#2563EB", "#7C3AED", "#4F46E5", "#DB2777", "#DC2626", "#16A34A", "#CA8A04"];

  const options = {
    rotations: 2,
    rotationAngles: [-90, 0],
    fontSizes: [20, 80],
    padding: 5,
    shape: 'circle',
    deterministic: true,
    spiral: 'rectangular',
    transitionDuration: 1000,
    fontFamily: selectedFont,
  };

  const callbacks = {
    getWordColor: word => {
      const index = wordCloudData.findIndex(item => item.word === word.text);
      return colors[index % colors.length];
    },
    getWordTooltip: word => `${word.text} (${word.value})`,
  };

  if (wordCloudData.length === 0) {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col ${darkMode ? 'bg-dark-bg text-dark-text' : 'bg-white'}`}>
        <div className={`p-4 shadow-md flex items-center justify-between ${darkMode ? 'bg-dark-card border-b border-dark-border' : 'bg-white border-b border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-dark-text' : 'text-gray-900'}`}>Word Cloud Visualization</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={saveAsImage}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={16} />
              <span>Save as Image</span>
            </button>
            <button
              onClick={toggleFullScreen}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button
              onClick={() => toggleFullScreen(false)} // Close button
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No words to display yet. Submit some words to see the word cloud!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${darkMode ? 'bg-dark-bg text-dark-text' : 'bg-white'}`}>
      <div className={`p-4 shadow-md flex items-center justify-between ${darkMode ? 'bg-dark-card border-b border-dark-border' : 'bg-white border-b border-gray-200'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-dark-text' : 'text-gray-900'}`}>Word Cloud Visualization</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={saveAsImage}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            <span>Save as Image</span>
          </button>
          <button
            onClick={toggleFullScreen}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <button
            onClick={() => toggleFullScreen(false)} // Close button
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      <div ref={containerRef} className="w-full h-full">
        <div ref={wordCloudRef}>
          <ReactWordcloud
            callbacks={callbacks}
            words={wordCloudData.map(item => ({ text: item.word, value: item.count }))}
            options={{
              ...options,
              fontFamily: selectedFont,
              fontSizes: isFullScreen ? [20, 160] : [20, 80],
            }}
            size={size}
          />
        </div>
      </div>
    </div>
  );
};

export default WordCloudVisualization;