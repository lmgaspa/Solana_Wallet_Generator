const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bip39 = require('bip39');
const { Keypair } = require('@solana/web3.js');

const generateSolanaWallet = () => {
  const mnemonic = bip39.generateMnemonic();
  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic);

  const keypair = Keypair.fromSeed(seedBuffer.slice(0, 32)); // Solana keypair precisa de um seed de 32 bytes
  const solanaAddress = keypair.publicKey.toBase58();
  const solanaPrivateKey = Buffer.from(keypair.secretKey).toString('hex');

  return {
    solanaAddress,
    mnemonic,
    solanaPrivateKey,
    seed: seedBuffer.toString('hex')
  };
};

router.post('/sol_generate_wallet', async (req, res) => {
  try {
    console.log('Recebida requisição para criar carteira Solana.');

    // Gerar carteira
    const { solanaAddress, mnemonic, solanaPrivateKey, seed } = generateSolanaWallet();

    res.status(200).json({ solAddress: solanaAddress, solMnemonic: mnemonic, solPrivateKey: solanaPrivateKey, solSeed: seed });
  } catch (error) {
    console.error('Erro ao criar carteira Solana:', error);
    res.status(500).json({ error: 'Erro ao criar carteira Solana' });
  }
});

module.exports = router;