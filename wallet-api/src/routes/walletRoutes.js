// src/routes/wallet.js
import express from 'express';
import { getSolanaPortfolio } from '../api/solanaApi.js';
import logger from '../utils/logger.js';
import { WALLET } from '../../config.js';

if (!WALLET) {
  throw new Error(`WALLET inválido: ${WALLET}`);
}

const router = express.Router();

/**
 * @swagger
 * /wallet/getInfoWallet:
 *   get:
 *     summary: Obtém informações completas de uma wallet Solana
 *     tags: [Wallet]
 *     responses:
 *       200:
 *         description: Dados obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     wallet: { type: string, example: "86AE..." }
 *                     balance: { type: number, example: 12.3456 }
 *                     unit: { type: string, example: "SOL" }
 *                     priceUsd: { type: number, example: 143.52 }
 *                     holdingsUsd: { type: number, example: 1772.5 }
 *                     priceChange:
 *                       type: object
 *                       properties:
 *                         1d: { type: number, example: -2.1 }
 *                         7d: { type: number, example: 5.3 }
 *                         30d: { type: number, example: 18.7 }
 *       404:
 *         description: Erro ao obter dados
 *       500:
 *         description: Erro interno
 */
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
