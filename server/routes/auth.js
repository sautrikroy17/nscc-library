const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'nscc_library_secret_key_2024';
const TOKEN_EXPIRY = '24h';

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, reg_number: user.reg_number },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      reg_number: user.reg_number,
      department: user.department,
      role: user.role,
    }
  });
});

// POST /api/auth/register (for students, librarians use seeded accounts)
router.post('/register', (req, res) => {
  const { name, email, password, reg_number, department } = req.body;

  if (!name || !email || !password || !reg_number) {
    return res.status(400).json({ error: 'Name, email, password and registration number are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR reg_number = ?').get(email, reg_number);
  if (existing) {
    return res.status(409).json({ error: 'User with this email or registration number already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();

  db.prepare(`
    INSERT INTO users (id, name, email, reg_number, department, role, password_hash)
    VALUES (?, ?, ?, ?, ?, 'student', ?)
  `).run(id, name.trim(), email.trim().toLowerCase(), reg_number.trim(), department || 'General', password_hash);

  const token = jwt.sign(
    { id, email: email.toLowerCase(), role: 'student', name, reg_number },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  res.status(201).json({
    token,
    user: { id, name, email: email.toLowerCase(), reg_number, department, role: 'student' }
  });
});

// GET /api/auth/me (verify token)
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, name, email, reg_number, department, role FROM users WHERE id = ?').get(decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
