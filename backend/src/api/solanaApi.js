import axios from 'axios';
import { ENV, RPC_URLS } from '../../config.js';

const RPC_URL = RPC_URLS[ENV];
if (!RPC_URL) throw new Error(`Invalid environment: ${ENV}`);

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

async function fetchTokenInfoByContract(ca) {
  try {
    const url = `${COINGECKO_API}/coins/solana/contract/${ca}`;
    const res = await axios.get(url);

    // Detectar erro 429 na resposta JSON (ex: { status: { error_code: 429, ... } })
    if (res.data?.status?.error_code === 429) {
      // Ignora este token
      return null;
    }

    return res.data;
  } catch (err) {
    // Se a resposta HTTP for 429 (rate limit), também ignora
    if (err.response?.status === 429) {
      return null;
    }
    return null;
  }
}

export async function getSolanaPortfolio(walletAddress) {
  try {
    const tokensResponse = await axios.post(RPC_URL, {
      jsonrpc: '2.0',
      id: 1,
      method: 'getTokenAccountsByOwner',
      params: [
        walletAddress,
        { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
        { encoding: 'jsonParsed' },
      ],
    });
    const tokenAccounts = tokensResponse.data.result.value;

    const tokens = [];

    for (const account of tokenAccounts) {
      const info = account.account.data.parsed.info;
      const mint = info.mint;
      const amount = parseFloat(info.tokenAmount.uiAmount || 0);
      if (amount <= 0) continue;

      const ca = mint;

      const cgInfo = await fetchTokenInfoByContract(ca);

      // Ignorar tokens com info null (inclui rate limit)
      if (!cgInfo) continue;

      tokens.push({
        mint,
        amount,
        ca,
        name: cgInfo.name || null,
        symbol: cgInfo.symbol?.toUpperCase() || null,
        priceUsd: cgInfo.market_data?.current_price?.usd || 0,
        icon: cgInfo.image?.thumb || null,
      });
    }

    return {
      success: true,
      data: {
        wallet: walletAddress,
        tokens,
      },
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
