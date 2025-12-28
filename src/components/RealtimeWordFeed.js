import React, { useMemo } from 'react';
import { X, Maximize2, Minimize2, Download } from 'lucide-react';

const RealtimeWordFeed = ({
  feedRef,
  showRealtimeFeed,
  setShowRealtimeFeed,
  realtimeWords,
  isFeedFullScreen,
  toggleFeedFullScreen,
  saveFeedAsImage,
  darkMode
}) => {
  if (!showRealtimeFeed) return null;

  const wordFrequencies = useMemo(() => {
    const frequencies = {};
    realtimeWords.forEach(word => {
      const text = word.text.toLowerCase();
      frequencies[text] = (frequencies[text] || 0) + 1;
    });
    return frequencies;
  }, [realtimeWords]);

  const uniqueWords = useMemo(() => {
    return Object.entries(wordFrequencies)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count);
  }, [wordFrequencies]);

  const maxCount = uniqueWords.length > 0 ? uniqueWords[0].count : 1;

  const getFontSize = (count) => {
    const minSize = isFeedFullScreen ? 20 : 14;
    const maxSize = isFeedFullScreen ? 80 : 60;
    if (maxCount === 1) return minSize;
    const size = minSize + ((count - 1) / (maxCount - 1)) * (maxSize - minSize);
    return Math.max(minSize, Math.min(maxSize, size));
  };

  const colors = ['text-blue-600', 'text-purple-600', 'text-indigo-600', 'text-pink-600', 'text-red-600', 'text-green-600', 'text-yellow-600'];

  return (
    <div ref={feedRef} className={`fixed inset-0 z-50 flex flex-col ${darkMode ? 'bg-dark-bg text-dark-text' : 'bg-white'}`}>
      <div className={`p-4 shadow-md flex items-center justify-between ${darkMode ? 'bg-dark-card border-b border-dark-border' : 'bg-white border-b border-gray-200'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-dark-text' : 'text-gray-900'}`}>Real-time Word Feed</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={saveFeedAsImage}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            <span>Save as Image</span>
          </button>
          <button
            onClick={toggleFeedFullScreen}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title={isFeedFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFeedFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <button
            onClick={() => setShowRealtimeFeed(false)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      <div className={`flex-1 p-4 overflow-y-auto flex flex-wrap items-center justify-center ${isFeedFullScreen ? 'p-8' : ''}`}>
        {realtimeWords.length > 0 ? (
          uniqueWords.map((item, index) => {
            const fontSize = getFontSize(item.count);
            const colorClass = colors[index % colors.length];

            return (
              <span
                key={item.text}
                className={`${colorClass} font-bold mx-2 my-1 transition-all fade-in`}
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: '1.3',
                  transform: `rotate(${Math.random() > 0.5 ? '2' : '-2'}deg)`,
                  animationDelay: `${index * 0.05}s`
                }}
                title={`${item.text} (${item.count} ${item.count === 1 ? 'time' : 'times'})`}
              >
                {item.text}
              </span>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No real-time words yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeWordFeed;
