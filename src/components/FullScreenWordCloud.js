import React from 'react';
import { Download, X } from 'lucide-react';

const FullScreenWordCloud = ({ 
  isFullScreen, 
  setIsFullScreen, 
  wordCloudData, 
  wordCloudRef, 
  getFontSize, 
  maxCount, 
  saveAsImage 
}) => {
  if (!isFullScreen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
        <h2 className="text-xl font-bold">Word Cloud - Full Screen</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={saveAsImage}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            <span>Save as Image</span>
          </button>
          <button
            onClick={() => setIsFullScreen(false)}
            className="p-2 text-white hover:bg-gray-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
        {wordCloudData.length > 0 ? (
          <div 
            ref={wordCloudRef}
            className="w-full h-full flex flex-wrap items-center justify-center"
          >
            {wordCloudData.map((item, index) => {
              const fontSize = getFontSize(item.count, maxCount);
              const colors = ['text-blue-600', 'text-purple-600', 'text-indigo-600', 'text-pink-600', 'text-red-600', 'text-green-600', 'text-yellow-600'];
              const colorClass = colors[index % colors.length];
              
              return (
                <span
                  key={item.word}
                  className={`${colorClass} font-bold mx-4 my-4 transition-all`}
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: '1.3',
                    transform: `rotate(${Math.random() > 0.5 ? '2' : '-2'}deg)`
                  }}
                  title={`${item.word} (${item.count} ${item.count === 1 ? 'time' : 'times'})`}
                >
                  {item.word}
                </span>
              );
            })}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500 text-2xl">No words to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullScreenWordCloud;