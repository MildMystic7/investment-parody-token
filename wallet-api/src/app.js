import express from 'express';
import tokenRoutes from './routes/tokenRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import logger from './utils/logger.js';  // importa o logger

const app = express();

app.use(express.json());

// Middleware global para log de todas as requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

app.use('/api/token', tokenRoutes);
app.use('/api/wallet', walletRoutes);

export default app;
