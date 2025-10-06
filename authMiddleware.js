const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key'; // Use your actual secret

function authMiddleware(req, res, next) {
  console.log('authMiddleware: Incoming headers:', req.headers); // Log headers for debugging
  // Check Authorization header first
  const authHeader = req.headers.authorization;
  let token;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.body && req.body.token) {
    // Support token sent in request body (useful for multipart/form-data)
    token = req.body.token;
    console.log('authMiddleware: token found in req.body');
  } else {
    console.log('authMiddleware: No token provided or wrong format.');
    return res.status(401).json({ message: 'No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, fullName, username }
    next();
  } catch (err) {
    console.log('authMiddleware: JWT verification error:', err.message);
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

module.exports = authMiddleware;
