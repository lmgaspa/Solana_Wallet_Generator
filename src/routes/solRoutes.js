const express = require('express');
const router = express.Router();
const axios = require('axios');
const mongoose = require('mongoose');
const AddressModel = require('../models/addressModel');

const url = 'mongodb+srv://btcex:dianalila@cluster0.y37vilu.mongodb.net/DianaExchange?retryWrites=true&w=majority';

router.post('/create_sol_address', async (req, res) => {
  const { userId } = req.body;

  try {
    console.log('Recebido POST em /create_sol_address!');
    console.log('userId:', userId);

    if (!userId) {
      return res.status(400).json({ error: 'User ID é obrigatório' });
    }

    await mongoose.connect(url);
    console.log('Conectado ao MongoDB Atlas');

    let addressRecord = await AddressModel.findOne({ userId });
    console.log('Registro encontrado:', addressRecord);
    
    // Valida se o registro existe e se possui um userId
    if (!addressRecord || !addressRecord.userId) {
      return res.status(400).json({ error: 'ID de usuário é obrigatório' });
    }

    if (!addressRecord.solAddress) {
      const { data } = await axios.post('https://solana-wallet-generator.onrender.com/api/sol_generate_wallet', { userId });
      console.log('Resposta da API externa:', data);

      const solAddress = data.solAddress; // Correção da chave

      if (!solAddress) {
        throw new Error('Endereço Solana não foi retornado pelo serviço externo');
      }

      addressRecord = await AddressModel.findOneAndUpdate(
        { userId: userId },
        { $set: { solAddress: solAddress } },
        { upsert: true, new: true }
      );
      console.log('Novo registro Solana criado ou atualizado:', addressRecord);
    } else {
      console.log('Registro Solana já existe para userId:', userId);
    }

    res.status(201).json({ solAddress: addressRecord.solAddress });
  } catch (error) {
    console.error('Erro ao criar ou atualizar registro Solana:', error);
    res.status(500).json({ error: 'Falha ao criar ou atualizar registro Solana' });
  }
});

module.exports = router;