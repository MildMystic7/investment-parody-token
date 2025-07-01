import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3001;
export const HOST = process.env.HOST || 'localhost';
export const ENV = process.env.ENV || 'dev';
export const WALLET = process.env.WALLET || 'Ggfa9P8UkD2tMDQ9Xmn4uPFZTWR1Fp4qiSrsdpGsQwAp';

export const RPC_URLS = {
  dev: 'https://api.devnet.solana.com',
  prod: 'https://api.mainnet-beta.solana.com',
};

export const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
export const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
export const SESSION_SECRET = process.env.SESSION_SECRET || 'default_session_secret';
export const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'; 