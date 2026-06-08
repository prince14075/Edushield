const jwt = require('jsonwebtoken');

// Middleware to protect API routes
const authMiddleware = (requiredRole) => {
  return (req, res, next) => {
    // Read JWT from httpOnly cookie 'token'
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Access token missing' });
    }

    try {
      const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_secret';
      const decoded = jwt.verify(token, secret);
      
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ success: false, error: 'Forbidden: Insufficient permissions' });
      }

      req.user = decoded;
      next();
    } catch (error) {
      console.error('JWT API Verification Error:', error.message);
      res.clearCookie('token');
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token' });
    }
  };
};

// Middleware to protect static page routes (redirect to login)
const protectPage = (requiredRole) => {
  return (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
      return res.redirect('/login');
    }

    try {
      const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_secret';
      const decoded = jwt.verify(token, secret);

      if (requiredRole && decoded.role !== requiredRole) {
        return res.redirect('/login');
      }

      req.user = decoded;
      next();
    } catch (error) {
      console.error('JWT Page Redirect Verification Error:', error.message);
      res.clearCookie('token');
      return res.redirect('/login');
    }
  };
};

module.exports = {
  authMiddleware,
  protectPage
};
