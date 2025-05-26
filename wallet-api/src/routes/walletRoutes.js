import express from 'express';
import { getSolanaBalance } from '../api/solanaApi.js';
import logger from '../utils/logger.js';
import { WALLET } from '../../config.js';

if (!WALLET) {
  throw new Error(`WALLET inválido: ${WALLET}`);
}

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Crypto
 *   description: Endpoints relacionados a wallets Solana
 */

/**
 * @swagger
 * /wallet/getInfoWallet:
 *   get:
 *     summary: Obtém o saldo em SOL de uma wallet Solana fixa (hardcoded)
 *     tags: [Wallet]
 *     responses:
 *       200:
 *         description: Saldo obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     wallet:
 *                       type: string
 *                       example: "86AEJExyjeNNgcp7GrAvCXTDicf5aGWgoERbXFiG1EdD"
 *                     balance:
 *                       type: number
 *                       example: 12.3456
 *                     unit:
 *                       type: string
 *                       example: "SOL"
 *       404:
 *         description: Erro ao obter saldo da wallet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Erro ao obter saldo para wallet"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Erro inesperado"
 */
router.get('/getInfoWallet', async (req, res) => {
  try {
    const balanceResponse = await getSolanaBalance(WALLET);

    if (balanceResponse.success) {
      logger.info(`Saldo total: ${balanceResponse.balance} SOL`);
      return res.json({
        success: true,
        data: {
          wallet: WALLET,
          balance: balanceResponse.balance,
          unit: 'SOL'
        }
      });
    } else {
      logger.warn(`Erro ao obter saldo para wallet ${WALLET}: ${balanceResponse.error}`);
      return res.status(404).json({
        success: false,
        error: balanceResponse.error
      });
    }
  } catch (error) {
    logger.error(`Erro inesperado no endpoint getInfoWallet: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
