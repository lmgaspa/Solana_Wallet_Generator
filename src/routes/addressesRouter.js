const express = require('express');
const AddressModel = require('../models/addressModel');
const { generateBTC, generateDOGE, generateSOL, generateDIANA } = require('../clients/addressGeneratorClient');

const router = express.Router();
const coins = new Set(['btc', 'doge', 'sol', 'diana']);

// POST /api/addresses/:coin
router.post('/:coin', async (req, res) => {
  const { coin } = req.params;
  const { userId } = req.body;

  if (!coins.has(coin)) return res.status(400).json({ error: 'Invalid coin' });
  if (!userId) return res.status(400).json({ error: 'User ID é obrigatório' });

  try {
    let doc = await AddressModel.findOne({ userId }).lean();

    if (doc && doc[`${coin}Address`]) {
      return res.status(200).json({ [`${coin}Address`]: doc[`${coin}Address`] });
    }

    let newAddress;
    if (coin === 'btc') newAddress = await generateBTC(userId);
    if (coin === 'doge') newAddress = await generateDOGE(userId);
    if (coin === 'sol') newAddress = await generateSOL(userId);
    if (coin === 'diana') newAddress = await generateDIANA(userId);

    if (!newAddress) throw new Error(`Endereço ${coin.toUpperCase()} não retornado`);

    const updated = await AddressModel.findOneAndUpdate(
      { userId },
      { $set: { [`${coin}Address`]: newAddress } },
      { new: true, upsert: true }
    ).lean();

    return res.status(201).json({ [`${coin}Address`]: updated[`${coin}Address`] });
  } catch (err) {
    console.error(`Erro em /${coin}:`, err.message);
    return res.status(500).json({ error: 'Falha ao criar ou atualizar endereço' });
  }
});

module.exports = router;
