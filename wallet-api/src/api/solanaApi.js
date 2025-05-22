import axios from 'axios';
import logger from '../utils/logger.js'; // ajusta o caminho se necessário

export async function getSolanaBalance(walletAddress) {
  const url = 'https://api.mainnet-beta.solana.com';
  const headers = { 'Content-Type': 'application/json' };
  const payload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'getBalance',
    params: [walletAddress]
  };

  try {
    const response = await axios.post(url, payload, { headers });

    if (response.status === 200 && response.data.result) {
      const lamports = response.data.result.value;
      const sol = lamports / 1_000_000_000;
      return {
        success: true,
        balance: sol
      };
    } else {
      return {
        success: false,
        error: msg
      };
    }
  } catch (error) {
    const msg = `Erro ao obter saldo da wallet ${walletAddress}: ${error.message}`;
    logger.error(msg);
    return {
      success: false,
      error: msg
    };
  }
}
