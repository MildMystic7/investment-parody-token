import axios from 'axios';
import logger from '../utils/logger.js';

/**
 * Obtém o saldo em SOL de uma wallet Solana através da API RPC pública.
 *
 * @param {string} walletAddress - O endereço da wallet Solana para consultar o saldo.
 * @returns {Promise<{success: boolean, balance?: number, error?: string}>} 
 *          Um objeto com o saldo (em SOL) em caso de sucesso ou uma mensagem de erro.
 */
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
      const msg = 'Resposta inesperada da API Solana.';
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
