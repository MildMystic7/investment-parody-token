import axios from 'axios';
import logger from '../utils/logger.js';

export async function getTokenInfo(contractAddress) {
  const url = `https://api.dexscreener.com/token-pairs/v1/solana/${contractAddress}`;

  try {
    const response = await axios.get(url);

    if (response.status === 200) {
      if (Array.isArray(response.data) && response.data.length > 0) {
        return {
          success: true,
          data: response.data[0]
        };
      } else {
        const msg = `CA ${contractAddress} não encontrado`;
        return {
          success: false,
          error: msg
        };
      }
    } else {
      const msg = `Erro na API Dexscreener: ${response.status}`;
      return {
        success: false,
        error: msg
      };
    }
  } catch (error) {
    const msg = `Erro interno no servidor`;
    return {
      success: false,
      error: msg
    };
  }
}
