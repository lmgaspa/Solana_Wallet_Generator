const express = require('express');
const AddressModel = require('../models/addressModel');
const { generateBTC, generateDOGE, generateSOL } = require('../clients/addressGeneratorClient');

const router = express.Router();
const coins = new Set(['btc', 'doge', 'sol', 'diana']);

router.post('/:coin', async (req, res) => {
  let coin = String(req.params.coin || '').toLowerCase();
  const userId = String(req.body?.userId || '').trim();

  if (!coins.has(coin)) return res.status(404).json({ error: 'Coin not supported' });
  if (!userId) return res.status(400).json({ error: 'User ID é obrigatório' });

  const storageCoin = (coin === 'diana') ? 'sol' : coin;        // onde salva
  const responseKey = (coin === 'diana') ? 'dianaAddress' : `${coin}Address`; // o nome que responde
  const storageKey  = `${storageCoin}Address`;                   // campo no Mongo

  try {
    // 1) Se já existe, retorna 200
    const existing = await AddressModel
      .findOne({ userId })
      .select({ [storageKey]: 1, _id: 0 })
      .lean();

    if (existing?.[storageKey]) {
      return res.status(200).json({ [responseKey]: existing[storageKey] });
    }

    // 2) Gerar novo address conforme moeda de armazenamento
    let newAddress;
    if (storageCoin === 'btc')  newAddress = await generateBTC(userId);
    if (storageCoin === 'doge') newAddress = await generateDOGE(userId);
    if (storageCoin === 'sol')  newAddress = await generateSOL(userId);

    if (!newAddress) {
      return res.status(502).json({ error: `Endereço ${storageCoin.toUpperCase()} não retornado` });
    }

    // 3) Persistir (upsert) e retornar 201
    const updated = await AddressModel.findOneAndUpdate(
      { userId },
      { $set: { [storageKey]: newAddress } },
      { new: true, upsert: true }
    ).select({ [storageKey]: 1, _id: 0 }).lean();

    return res.status(201).json({ [responseKey]: updated[storageKey] });
  } catch (err) {
    // Tratamento especial p/ índices antigos sem partialFilter (null dup)
    if (err?.code === 11000) {
      console.error(`[${coin}] E11000 duplicate`, err?.keyValue);
      return res.status(409).json({ error: 'Duplicate address constraint', details: err?.keyValue });
    }
    console.error(`Erro em /${coin}:`, err?.message || err);
    return res.status(500).json({ error: 'Falha ao criar ou atualizar endereço' });
  }
});

module.exports = router;
