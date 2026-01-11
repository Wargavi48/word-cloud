const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? undefined : ['http://localhost:3000', 'http://localhost:4000'],
  credentials: true
}));
app.use(express.json());

// Connect to SQLite database
const dbPath = path.join(__dirname, 'wordcloud.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create tables if they don't exist
db.serialize(() => {
  // Table for storing words
  db.run(`CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Table for admin users
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Table for settings
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    exclude_words TEXT,
    character_limit INTEGER DEFAULT 50,
    exclude_words_enabled BOOLEAN DEFAULT FALSE,
    character_limit_enabled BOOLEAN DEFAULT TRUE,
    moderation_enabled BOOLEAN DEFAULT TRUE,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert default admin user if none exists
  db.get("SELECT id FROM admins WHERE username = ?", ['admin'], (err, row) => {
    if (!row) {
      const defaultPassword = 'admin123'; // Default password - should be changed in production
      bcrypt.hash(defaultPassword, 10, (err, hash) => {
        if (err) {
          console.error('Error hashing default password:', err);
        } else {
          db.run("INSERT INTO admins (username, password_hash) VALUES (?, ?)", ['admin', hash], (err) => {
            if (err) {
              console.error('Error inserting default admin:', err);
            } else {
              console.log('Default admin user created');
            }
          });
        }
      });
    }
  });

  // Insert default settings if none exist
  db.get("SELECT id FROM settings", (err, row) => {
    if (!row) {
      db.run(`INSERT INTO settings (exclude_words, character_limit, exclude_words_enabled, character_limit_enabled, moderation_enabled) 
              VALUES (?, ?, ?, ?, ?)`, ['', 50, 0, 1, 1], (err) => {
        if (err) {
          console.error('Error inserting default settings:', err);
        } else {
          console.log('Default settings created');
        }
      });
    }
  });
});

// API Routes

// Get all words
app.get('/api/words', (req, res) => {
  const { status } = req.query;
  let query = 'SELECT * FROM words';
  let params = [];
  
  if (status) {
    query += ' WHERE status = ?';
    params = [status];
  }
  query += ' ORDER BY timestamp DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add a new word
app.post('/api/words', (req, res) => {
  const { text } = req.body;
  
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Invalid word text' });
  }

  // Get current settings to validate the submission
  db.get('SELECT * FROM settings LIMIT 1', [], (err, settings) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Validate submission based on settings
    if (settings.character_limit_enabled && text.length > settings.character_limit) {
      return res.status(400).json({ 
        error: `Text exceeds ${settings.character_limit} character limit` 
      });
    }

    if (settings.exclude_words_enabled && settings.exclude_words) {
      const excludeWords = settings.exclude_words.split(',').map(word => word.trim().toLowerCase());
      const lowercaseText = text.toLowerCase();
      const excludedWord = excludeWords.find(word => lowercaseText.includes(word));
      if (excludedWord) {
        return res.status(400).json({ 
          error: `Text contains excluded word: "${excludedWord}"` 
        });
      }
    }

    // Determine status based on moderation settings
    const status = settings.moderation_enabled ? 'pending' : 'approved';
    
    const stmt = db.prepare('INSERT INTO words (text, status) VALUES (?, ?)');
    stmt.run(text.trim(), status, function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ 
        id: this.lastID, 
        text: text.trim(), 
        status,
        timestamp: new Date().toISOString()
      });
    });
    stmt.finalize();
  });
});

// Update word status (approve/reject)
app.put('/api/words/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  db.run('UPDATE words SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Word not found' });
    } else {
      res.json({ message: 'Status updated successfully' });
    }
  });
});

// Delete a word
app.delete('/api/words/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM words WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Word not found' });
    } else {
      res.json({ message: 'Word deleted successfully' });
    }
  });
});

// Reset all words
app.delete('/api/words', (req, res) => {
  db.run('DELETE FROM words', [], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'All words deleted successfully' });
  });
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  db.get('SELECT * FROM admins WHERE username = ?', [username], (err, admin) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    bcrypt.compare(password, admin.password_hash, (err, isValid) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // In a real app, you'd generate a JWT token here
      res.json({ 
        success: true, 
        message: 'Login successful',
        admin: { id: admin.id, username: admin.username }
      });
    });
  });
});

// Get admin settings
app.get('/api/settings', (req, res) => {
  db.get('SELECT * FROM settings LIMIT 1', [], (err, settings) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(settings);
  });
});

// Update admin settings
app.put('/api/settings', (req, res) => {
  const { excludeWords, characterLimit, excludeWordsEnabled, characterLimitEnabled, moderationEnabled } = req.body;
  
  db.run(`
    UPDATE settings 
    SET exclude_words = ?, 
        character_limit = ?, 
        exclude_words_enabled = ?, 
        character_limit_enabled = ?, 
        moderation_enabled = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `, [
    Array.isArray(excludeWords) ? excludeWords.join(',') : excludeWords || '',
    characterLimit || 50,
    excludeWordsEnabled ? 1 : 0,
    characterLimitEnabled ? 1 : 0,
    moderationEnabled ? 1 : 0
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Settings updated successfully' });
  });
});

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'build')));

// Catch all handler to serve React app for non-API routes
app.get(/^(?!\/api\/).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database file: ${dbPath}`);
});