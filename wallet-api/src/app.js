import express from 'express';
import logger from './utils/logger.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

// routes
import tokenRoutes from './routes/tokenRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import voteRoutes from './routes/voteRoutes.js';

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/token', tokenRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/vote', voteRoutes);

// Rota para documentação swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
