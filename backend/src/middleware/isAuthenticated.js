import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config.js';
import User from '../models/User.js';

export const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token is required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is missing.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findByPk(decoded.id);

    if (!user) {
        return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }

    // Attach the user object to the request for use in protected routes
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid authentication token. Please log in again.' });
    }
    console.error("Authentication error:", error);
    return res.status(500).json({ message: 'An internal server error occurred during authentication.' });
  }
}; 