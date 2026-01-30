const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from parent folder (the existing site)
app.use(express.static(path.join(__dirname, '..')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// POST contact message
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }

  try {
    const stmt = db.prepare('INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)');
    const info = stmt.run(name, email, subject || null, message);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    console.error('DB insert error:', err);
    res.status(500).json({ error: 'Server error saving message' });
  }
});

// GET messages (simple admin endpoint)
app.get('/api/messages', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, name, email, subject, message, created_at FROM messages ORDER BY created_at DESC').all();
    res.json({ messages: rows });
  } catch (err) {
    console.error('DB read error:', err);
    res.status(500).json({ error: 'Server error reading messages' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
