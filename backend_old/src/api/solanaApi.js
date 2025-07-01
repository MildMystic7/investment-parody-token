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
    // Get SOL balance
    const balanceResponse = await axios.post(RPC_URL, {
      jsonrpc: '2.0',
      id: 1,
      method: 'getBalance',
      params: [walletAddress],
    });
    
    const solBalance = balanceResponse.data.result.value / 1000000000; // Convert lamports to SOL
    
    // Get SOL price from CoinGecko
    let solPriceUsd = 0;
    try {
      const solPriceResponse = await axios.get(`${COINGECKO_API}/simple/price?ids=solana&vs_currencies=usd`);
      solPriceUsd = solPriceResponse.data.solana?.usd || 0;
    } catch (priceErr) {
      console.log('Could not fetch SOL price:', priceErr.message);
    }

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
    let totalValueUsd = solBalance * solPriceUsd; // Start with SOL value

    // Add SOL as the first token
    tokens.push({
      mint: 'So11111111111111111111111111111111111111112', // SOL mint address
      amount: solBalance,
      ca: 'So11111111111111111111111111111111111111112',
      name: 'Solana',
      symbol: 'SOL',
      priceUsd: solPriceUsd,
      icon: 'https://assets.coingecko.com/coins/images/4128/thumb/solana.png',
    });

    for (const account of tokenAccounts) {
      const info = account.account.data.parsed.info;
      const mint = info.mint;
      const amount = parseFloat(info.tokenAmount.uiAmount || 0);
      if (amount <= 0) continue;

      const ca = mint;

      const cgInfo = await fetchTokenInfoByContract(ca);

      // Ignorar tokens com info null (inclui rate limit)
      if (!cgInfo) continue;

      const priceUsd = cgInfo.market_data?.current_price?.usd || 0;
      totalValueUsd += amount * priceUsd;

      tokens.push({
        mint,
        amount,
        ca,
        name: cgInfo.name || null,
        symbol: cgInfo.symbol?.toUpperCase() || null,
        priceUsd,
        icon: cgInfo.image?.thumb || null,
      });
    }

    return {
      success: true,
      data: {
        wallet: walletAddress,
        balance: solBalance, // Add balance field that frontend expects
        tokens,
        totalValueUsd,
        solValueUsd: solBalance * solPriceUsd
      },
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
