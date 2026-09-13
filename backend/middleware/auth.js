const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'nscc_library_secret_key_2024';

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireLibrarian(req, res, next) {
  if (req.user?.role !== 'librarian') {
    return res.status(403).json({ error: 'Librarian access required' });
  }
  next();
}

module.exports = { authenticateToken, requireLibrarian };
