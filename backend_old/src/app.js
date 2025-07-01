import express from 'express';
import logger from './utils/logger.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import cors from 'cors';
import session from 'express-session';
import passport from './auth/passport.js';
import { SESSION_SECRET } from '../config.js';

// routes
import tokenRoutes from './routes/tokenRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import voteRoutes from './routes/voteRoutes.js';
import authRoutes from './routes/authRoutes.js';
import proposalRoutes from './routes/proposalRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Session middleware is required for Passport's Twitter strategy, even if we don't use it for storing the user.
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/token', tokenRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/proposals', proposalRoutes);

// Rota para documentação swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
