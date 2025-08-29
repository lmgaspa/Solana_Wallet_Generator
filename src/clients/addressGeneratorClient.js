const axios = require('axios');
const bip39 = require('bip39');
const { Keypair } = require('@solana/web3.js');

const client = axios.create({
  timeout: Number(process.env.HTTP_TIMEOUT_MS || 10000)
});

async function postWithRetry(url, payload, retries = Number(process.env.HTTP_RETRIES || 2)) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await client.post(url, payload);
    } catch (err) {
      lastErr = err;
      await new Promise(r => setTimeout(r, 300 * (i + 1))); // backoff
    }
  }
  throw lastErr;
}

// BTC
async function generateBTC(userId) {
  const url = process.env.GEN_BTC_URL;
  const { data } = await postWithRetry(url, { userId });
  return data.btcaddress || data.btcAddress;
}

// DOGE
async function generateDOGE(userId) {
  const url = process.env.GEN_DOGE_URL;
  const { data } = await postWithRetry(url, { userId });
  return data.dogeAddress;
}

// SOL
async function generateSOL(userId) {
  if (process.env.GEN_SOL_MODE === 'local') {
    const mnemonic = bip39.generateMnemonic();
    const seedBuffer = bip39.mnemonicToSeedSync(mnemonic);
    const keypair = Keypair.fromSeed(seedBuffer.slice(0, 32));
    return keypair.publicKey.toBase58();
  } else {
    const url = process.env.GEN_SOL_URL;
    const { data } = await postWithRetry(url, { userId });
    return data.solAddress;
  }
}

// DIANA
async function generateDIANA(userId) {
  const url = process.env.GEN_DIANA_URL;
  const { data } = await postWithRetry(url, { userId });
  return data.dianaAddress || data.solAddress;
}

module.exports = { generateBTC, generateDOGE, generateSOL, generateDIANA };
