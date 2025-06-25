import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, FRONTEND_URL } from '../../config.js';

const router = express.Router();

// Step 1: Redirect to Twitter to authenticate
// This is the endpoint the frontend will call
router.get('/twitter', passport.authenticate('twitter'));

// Step 2: The callback URL that Twitter will redirect to after authentication
router.get(
  '/twitter/callback',
  passport.authenticate('twitter', {
    failureRedirect: `${FRONTEND_URL}/?error=auth_failed`, // Redirect on failure
    session: false, // We are using JWT, not sessions
  }),
  (req, res) => {
    // Step 3: Authentication was successful.
    // `req.user` contains the authenticated user object from our Passport config.
    const user = req.user;
    const payload = {
      id: user.id,
      username: user.username,
    };

    // Create a JWT for the user
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '7d', // Token expires in 7 days
    });

    // Step 4: Redirect back to the frontend's callback page with the token and user info
    const userString = encodeURIComponent(JSON.stringify(user));
    res.redirect(
      `${FRONTEND_URL}/auth/callback?token=${token}&user=${userString}`
    );
  }
);

export default router; 