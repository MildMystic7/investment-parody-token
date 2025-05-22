import express from 'express';
import { getSolanaBalance } from '../api/solanaApi.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wallet
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
 *                 wallet:
 *                   type: string
 *                   example: "86AEJExyjeNNgcp7GrAvCXTDicf5aGWgoERbXFiG1EdD"
 *                 balance:
 *                   type: number
 *                   example: 12.3456
 *                 unit:
 *                   type: string
 *                   example: "SOL"
 *       404:
 *         description: Erro ao obter saldo da wallet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *                 error:
 *                   type: string
 *                   example: "Erro inesperado"
 */
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
