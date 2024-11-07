const express = require('express');
const router = express.Router();
const axios = require('axios');
const mongoose = require('mongoose');
const AddressModel = require('../models/addressModel');

const url = 'mongodb+srv://btcex:dianalila@cluster0.y37vilu.mongodb.net/DianaExchange?retryWrites=true&w=majority';

router.post('/create_diana_address', async (req, res) => {
  const { userId } = req.body;

  try {
    console.log('Recebido POST em /create_diana_address!');
    console.log('userId:', userId);

    // Validação básica de entrada
    if (!userId) {
      return res.status(400).json({ error: 'User ID é obrigatório' });
    }

    // Conexão com MongoDB
    await mongoose.connect(url);
    console.log('Conectado ao MongoDB Atlas');

    // Busca registro existente pelo userId
    let addressRecord = await AddressModel.findOne({ userId });
    console.log('Registro encontrado:', addressRecord);
    
    // Valida se o registro existe e se possui um userId
    if (!addressRecord || !addressRecord.userId) {
      return res.status(400).json({ error: 'ID de usuário é obrigatório' });
    }

    // Verifica se já existe um endereço Diana Coin registrado
    if (!addressRecord.dianaAddress) {
      // Chamada para gerar o endereço Diana Coin
      const { data } = await axios.post('https://solana-wallet-generator.onrender.com/api/sol_generate_wallet', { userId });
      console.log('Resposta da rota Diana Coin:', data);

      const dianaAddress = data.solAddress; // Ajuste conforme a estrutura da resposta da rota

      // Valida se o endereço foi retornado corretamente
      if (!dianaAddress) {
        throw new Error('Endereço Diana Coin não foi retornado pela rota');
      }

      // Atualiza o registro com o novo endereço Diana Coin
      addressRecord = await AddressModel.findOneAndUpdate(
        { userId },
        { $set: { dianaAddress } },
        { upsert: true, new: true }
      );
      console.log('Novo registro Diana Coin criado ou atualizado:', addressRecord);
    } else {
      console.log('Registro Diana Coin já existe para userId:', userId);
    }

    // Retorna o endereço Diana Coin para o frontend
    res.status(201).json({ dianaAddress: addressRecord.dianaAddress });
  } catch (error) {
    console.error('Erro ao criar ou atualizar registro Diana Coin:', error);
    res.status(500).json({ error: 'Falha ao criar ou atualizar registro Diana Coin!' });
  }
});

module.exports = router;