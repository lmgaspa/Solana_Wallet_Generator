const express = require('express');
const AddressModel = require('../models/addressModel');
const { generateBTC, generateDOGE, generateSOL } = require('../clients/addressGeneratorClient');

const router = express.Router();

// Aceita btc, doge, sol e o alias diana (que usa o mesmo address de sol)
const coins = new Set(['btc', 'doge', 'sol', 'diana']);

router.post('/:coin', async (req, res) => {
  const { coin } = req.params;
  const { userId } = req.body;

  if (!coins.has(coin)) return res.status(404).json({ error: 'Coin not supported' });
  if (!userId) return res.status(400).json({ error: 'User ID é obrigatório' });

  // Mapear 'diana' -> 'sol' no armazenamento, mas responder com a chave dianaAddress
  const storageCoin = coin === 'diana' ? 'sol' : coin;
  const responseKey = coin === 'diana' ? 'dianaAddress' : `${coin}Address`;
  const storageKey  = `${storageCoin}Address`;

  try {
    // 1) Ler doc atual
    let doc = await AddressModel.findOne({ userId }).lean();

    // 2) Se já tem o endereço (solAddress no caso de diana), retorna
    if (doc && doc[storageKey]) {
      return res.status(200).json({ [responseKey]: doc[storageKey] });
    }

    // 3) Gerar conforme a moeda de armazenamento
    let newAddress;
    if (storageCoin === 'btc')  newAddress = await generateBTC(userId);
    if (storageCoin === 'doge') newAddress = await generateDOGE(userId);
    if (storageCoin === 'sol')  newAddress = await generateSOL(userId);

    if (!newAddress) throw new Error(`Endereço ${storageCoin.toUpperCase()} não retornado`);

    // 4) Persistir no campo de armazenamento (solAddress p/ diana)
    const updated = await AddressModel.findOneAndUpdate(
      { userId },
      { $set: { [storageKey]: newAddress } },
      { new: true, upsert: true }
    ).lean();

    return res.status(201).json({ [responseKey]: updated[storageKey] });
  } catch (err) {
    console.error(`Erro em /${coin}:`, err.message);
    return res.status(500).json({ error: 'Falha ao criar ou atualizar endereço' });
  }
});

module.exports = router;
