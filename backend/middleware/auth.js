/**
 * middleware/auth.js — JWT authentication middleware
 */

const jwt = require('jsonwebtoken');

/**
 * requireAuth — verifies the JWT token in the Authorization header.
 * Attaches the decoded user payload to req.user.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * requireRole — checks that the authenticated user has one of the allowed roles.
 * Must be used after requireAuth.
 *
 * @param {...string} roles  Allowed roles, e.g. requireRole('admin', 'hr')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
