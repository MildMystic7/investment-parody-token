import express from 'express';
import { getTokenInfo } from '../api/dex-api.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Token
 *   description: Endpoints para informação de tokens
 */

/**
 * @swagger
 * /token/{tokenAddress}:
 *   get:
 *     summary: Obtém informação do token pelo endereço
 *     tags: [Token]
 *     parameters:
 *       - in: path
 *         name: tokenAddress
 *         schema:
 *           type: string
 *         required: true
 *         description: Endereço do token a consultar
 *     responses:
 *       200:
 *         description: Informações do token encontradas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: json
 *                   example: {}
 *       404:
 *         description: Token não encontrado
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
 *                   example: "CA xxxx não encontrado"
 *       500:
 *         description: Erro interno no servidor
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
 *                   example: "Erro ao consultar token"
 */
router.get('/:tokenAddress', async (req, res) => {
  const { tokenAddress } = req.params;

  try {
    const tokenAddress_res = await getTokenInfo(tokenAddress);

    if (tokenAddress_res.success) {
      logger.info(`Token encontrado: ${tokenAddress}`);
      return res.json(tokenAddress_res); 
    } else {
      logger.warn(`Token não encontrado: ${tokenAddress}`);
      return res.status(404).json(tokenAddress_res);
    }
  } catch (error) {
    logger.error(`Erro ao consultar token ${tokenAddress}: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
