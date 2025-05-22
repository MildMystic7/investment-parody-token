// src/routes/walletRoutes.js
import express from 'express';
import { getSolanaBalance } from '../api/solanaApi.js';
import logger from '../utils/logger.js';  // importa o logger

const router = express.Router();

router.get('/getInfoWallet', async (req, res) => {
  // const wallet = req.query.wallet;
  const wallet = '86AEJExyjeNNgcp7GrAvCXTDicf5aGWgoERbXFiG1EdD';
  try {
    const balanceResponse = await getSolanaBalance(wallet);

    if (balanceResponse.success) {
      logger.info(`Saldo total : ${balanceResponse.balance} SOL`);
      res.json({
        wallet,
        balance: balanceResponse.balance,
        unit: 'SOL'
      });
    } else {
      logger.warn(`Erro ao obter saldo para wallet ${wallet}: ${balanceResponse.error}`);
      res.status(404).json({ error: balanceResponse.error });
    }
  } catch (error) {
    logger.error(`Erro inesperado no endpoint getInfoWallet: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

export default router;