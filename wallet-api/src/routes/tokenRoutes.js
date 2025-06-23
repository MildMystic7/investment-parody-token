import express from 'express';
import axios from 'axios';
import logger from '../utils/logger.js';

const router = express.Router();

router.get('/ca/:tokenAddress', async (req, res) => {
  const { tokenAddress } = req.params;

  try {
    const response = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);

    if (response.data && response.data.pairs && response.data.pairs.length > 0) {
      const tokenData = response.data.pairs[0]; // Pode haver vários pares, aqui assume-se o primeiro
      logger.info(`Token encontrado: ${tokenAddress}`);
      return res.json({ success: true, data: tokenData });
    } else {
      logger.warn(`Token não encontrado: ${tokenAddress}`);
      return res.status(404).json({ success: false, message: 'Token não encontrado na DexScreener.' });
    }
  } catch (error) {
    logger.error(`Erro ao consultar token ${tokenAddress}: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/top-meme-coins', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets',
      {
        params: {
          vs_currency: 'usd',
          category: 'meme-token',
          order: 'market_cap_desc',
          per_page: 30,
          page: 1,
        },
      }
    );

  const memeCoins = response.data.map(coin => {
    const platforms = coin.platforms || {};
    const [network, address] = Object.entries(platforms)[0] || [null, null];

    return {
      name: coin.name,
      symbol: coin.symbol,
      price: coin.current_price,
      marketCap: coin.market_cap,
      contractAddress: address,
      network: network,
      image: coin.image,
    };
  });

    res.json({ success: true, count: memeCoins.length, data: memeCoins });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: 'Erro ao buscar meme coins' });
  }
});

export default router;
