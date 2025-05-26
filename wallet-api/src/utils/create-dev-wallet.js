import { Keypair, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';

async function main() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  // Gera nova wallet
  const wallet = Keypair.generate();
  const publicKey = wallet.publicKey.toBase58();
  const privateKeyHex = Buffer.from(wallet.secretKey).toString('hex');

  console.log('🪪 Public Key:', publicKey);
  console.log('🔐 Private Key (hex):', privateKeyHex);

  // Cria pasta 'wallets' se não existir
  const folderPath = path.resolve('wallets');
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  // Guarda ficheiro JSON
  const walletData = {
    publicKey,
    privateKeyHex,
  };

  const filePath = path.join(folderPath, `${publicKey}.json`);
  fs.writeFileSync(filePath, JSON.stringify(walletData, null, 100));
  console.log(`📁 Wallet guardada em: ${filePath}`);

  // Airdrop de 2 SOL
  console.log('\n🚀 A pedir airdrop de 100 SOL...');
  const sig = await connection.requestAirdrop(wallet.publicKey, 2 * LAMPORTS_PER_SOL);
  await connection.confirmTransaction(sig, 'confirmed');

  // Verifica saldo
  const balance = await connection.getBalance(wallet.publicKey);
  console.log(`💰 Saldo após airdrop: ${balance / LAMPORTS_PER_SOL} SOL`);
}

main().catch((err) => {
  console.error('❌ Erro:', err.message);
});