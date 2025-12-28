// Advanced Word Cloud Layout Algorithm
// Based on Wordle algorithm with spiral placement

export const generateAdvancedWordCloud = (wordData, width, height) => {
  if (!wordData || wordData.length === 0) return [];
  
  // Sort words by frequency (descending)
  const sortedWords = [...wordData].sort((a, b) => b.count - a.count);
  
  const centerX = width / 2;
  const centerY = height / 2;
  const placedWords = [];
  const collisionGrid = {};
  const gridSize = 10; // Grid cell size for collision detection
  
  // Calculate max and min font sizes
  const maxFontSize = 80;
  const minFontSize = 14;
  const maxCount = Math.max(...sortedWords.map(w => w.count));
  const minCount = Math.min(...sortedWords.map(w => w.count));
  
  sortedWords.forEach((wordObj, index) => {
    // Calculate font size based on frequency (logarithmic scale for better distribution)
    const fontSize = calculateLogFontSize(wordObj.count, minCount, maxCount, minFontSize, maxFontSize);
    
    // Calculate word dimensions (approximate)
    const wordWidth = wordObj.word.length * fontSize * 0.6;
    const wordHeight = fontSize * 1.2;
    
    // Try to place the word
    let position = findPosition(
      wordObj.word,
      wordWidth,
      wordHeight,
      centerX,
      centerY,
      placedWords,
      collisionGrid,
      gridSize,
      index
    );
    
    if (position) {
      placedWords.push({
        ...wordObj,
        x: position.x,
        y: position.y,
        fontSize,
        rotation: position.rotation,
        color: getColorForWord(index, wordObj.count, maxCount)
      });
      
      // Mark grid cells as occupied
      markGridOccupied(position.x, position.y, wordWidth, wordHeight, collisionGrid, gridSize);
    }
  });
  
  return placedWords;
};

const calculateLogFontSize = (count, minCount, maxCount, minSize, maxSize) => {
  if (maxCount === minCount) return (minSize + maxSize) / 2;
  
  // Logarithmic scaling for better visual distribution
  const logCount = Math.log(count);
  const logMin = Math.log(minCount);
  const logMax = Math.log(maxCount);
  
  const normalized = (logCount - logMin) / (logMax - logMin);
  return minSize + normalized * (maxSize - minSize);
};

const findPosition = (word, width, height, centerX, centerY, placedWords, collisionGrid, gridSize, attempt) => {
  // Start with center position
  let x = centerX - width / 2;
  let y = centerY - height / 2;
  
  // Add some randomness to initial position
  const angle = (attempt * 137.5) % 360; // Golden angle for good distribution
  const distance = Math.sqrt(attempt) * 20;
  
  x += Math.cos(angle * Math.PI / 180) * distance;
  y += Math.sin(angle * Math.PI / 180) * distance;
  
  // Try spiral placement
  const maxAttempts = 200;
  let spiralStep = 0;
  
  while (spiralStep < maxAttempts) {
    // Check for collisions
    if (!hasCollision(x, y, width, height, placedWords, collisionGrid, gridSize)) {
      // Add slight random rotation (-15 to 15 degrees)
      const rotation = (Math.random() * 30) - 15;
      
      return {
        x: x + width / 2, // Return center position
        y: y + height / 2,
        rotation
      };
    }
    
    // Move in a spiral pattern
    spiralStep++;
    const spiralAngle = spiralStep * 0.5;
    const spiralRadius = spiralStep * 2;
    
    x = centerX + Math.cos(spiralAngle) * spiralRadius - width / 2;
    y = centerY + Math.sin(spiralAngle) * spiralRadius - height / 2;
  }
  
  // If no position found, place at a random edge
  x = centerX + (Math.random() - 0.5) * (centerX - width);
  y = centerY + (Math.random() - 0.5) * (centerY - height);
  
  return {
    x: x + width / 2,
    y: y + height / 2,
    rotation: (Math.random() * 30) - 15
  };
};

const hasCollision = (x, y, width, height, placedWords, collisionGrid, gridSize) => {
  // Check grid-based collision
  const gridX = Math.floor(x / gridSize);
  const gridY = Math.floor(y / gridSize);
  const gridWidth = Math.ceil(width / gridSize);
  const gridHeight = Math.ceil(height / gridSize);
  
  for (let gx = gridX; gx < gridX + gridWidth; gx++) {
    for (let gy = gridY; gy < gridY + gridHeight; gy++) {
      const gridKey = `${gx},${gy}`;
      if (collisionGrid[gridKey]) {
        return true;
      }
    }
  }
  
  // Check precise collision with other words (optional, more expensive)
  for (const placedWord of placedWords) {
    const dx = Math.abs((x + width / 2) - placedWord.x);
    const dy = Math.abs((y + height / 2) - placedWord.y);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < (width + placedWord.fontSize * placedWord.word.length * 0.6) / 2) {
      return true;
    }
  }
  
  return false;
};

const markGridOccupied = (x, y, width, height, collisionGrid, gridSize) => {
  const startX = Math.floor((x - width / 2) / gridSize);
  const startY = Math.floor((y - height / 2) / gridSize);
  const endX = Math.ceil((x + width / 2) / gridSize);
  const endY = Math.ceil((y + height / 2) / gridSize);
  
  for (let gx = startX; gx <= endX; gx++) {
    for (let gy = startY; gy <= endY; gy++) {
      const gridKey = `${gx},${gy}`;
      collisionGrid[gridKey] = true;
    }
  }
};

const getColorForWord = (index, count, maxCount) => {
  const colorSchemes = [
    ['#3b82f6', '#8b5cf6', '#6366f1', '#ec4899', '#ef4444'], // Blue-Purple-Pink
    ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'], // Green
    ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'], // Amber
    ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'], // Purple
    ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d']  // Red
  ];
  
  const schemeIndex = Math.floor(count / (maxCount / colorSchemes.length)) % colorSchemes.length;
  const colorIndex = index % colorSchemes[schemeIndex].length;
  
  return colorSchemes[schemeIndex][colorIndex];
};

// Helper function for basic word cloud (backward compatibility)
export const generateBasicWordCloud = (approvedWords) => {
  const wordFrequency = {};
  approvedWords.forEach(response => {
    const words = response.text.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.trim()) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });
  });

  const wordArray = Object.entries(wordFrequency)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);

  return wordArray;
};