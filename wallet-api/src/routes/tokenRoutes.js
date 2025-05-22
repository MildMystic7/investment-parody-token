import express from 'express';
import { getTokenInfo } from '../api/dex-api.js';
import logger from '../utils/logger.js';

const router = express.Router();

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
