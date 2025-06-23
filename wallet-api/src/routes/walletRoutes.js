// src/routes/wallet.js
import express from 'express';
import { getSolanaPortfolio } from '../api/solanaApi.js';
import logger from '../utils/logger.js';
import { WALLET } from '../../config.js';

if (!WALLET) {
  throw new Error(`WALLET inválido: ${WALLET}`);
}

const router = express.Router();

router.get('/getInfoWallet', async (req, res) => {
  try {
    const result = await getSolanaPortfolio(WALLET);
    if (result.success) {
      logger.info(`Wallet ${WALLET}`);

      return res.status(200).json({
        success: true,
        data: {
          wallet: result.data.wallet,
          tokens: result.data.tokens,              // Array com os tokens (inclui SOL)
          totalValueUsd: result.data.solValueUsd
        }
      });
    } else {
      logger.warn(`Erro ao obter info da wallet: ${result.error}`);
      return res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    logger.error(`Erro interno: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
});


export default router;
