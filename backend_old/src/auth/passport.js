import passport from 'passport';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET } from '../../config.js';
import User from '../models/User.js';

passport.use(
  new TwitterStrategy(
    {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      callbackURL: 'http://localhost:3001/api/auth/twitter/callback',
      proxy: true,
    },
    async (token, tokenSecret, profile, done) => {
      try {
        // Find or create a user based on their X profile
        const [user, created] = await User.findOrCreate({
          where: { id: profile.id },
          defaults: {
            username: profile.username,
            displayName: profile.displayName,
            photo: profile.photos[0].value.replace('_normal', ''), // Get high-res photo
            followersCount: profile._json.followers_count,
          },
        });

        // If the user already existed, update their info in case it changed
        if (!created) {
          user.username = profile.username;
          user.displayName = profile.displayName;
          user.photo = profile.photos[0].value.replace('_normal', '');
          user.followersCount = profile._json.followers_count;
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport; 