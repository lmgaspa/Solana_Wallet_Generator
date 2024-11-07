const express = require('express');
const router = express.Router();
const axios = require('axios');
const mongoose = require('mongoose');
const AddressModel = require('../models/addressModel');

const url = 'mongodb+srv://btcex:dianalila@cluster0.y37vilu.mongodb.net/DianaExchange?retryWrites=true&w=majority';

// Nova rota para criar ou atualizar endereço de Diana Coin
router.post('/create_diana_address', async (req, res) => {
  const { userId } = req.body;

  try {
    console.log('Recebido POST em /create_diana_address!');
    console.log('userId:', userId);

    // Verifica se o userId foi fornecido
    if (!userId) {
      return res.status(400).json({ error: 'User ID é obrigatório' });
    }

    await mongoose.connect(url);
    console.log('Conectado ao MongoDB Atlas');

    // Verifica se já existe um registro Diana para o userId
    let diana = await AddressModel.findOne({ userId });
    console.log('Registro Diana encontrado:', diana);

    if (!diana || !diana.dianaAddress) {
      // Envia a requisição POST para obter o dianaAddress
      // Envia a requisição POST para obter o btcAddress
      const { data } = await axios.post('https://btcaddressgen.onrender.com/btc_address_generator/', { userId });
      const dianaAddress = data.dianaAddress; // Verifique a estrutura da resposta do serviço externo

      // Verifica se o dianaAddress foi retornado corretamente
      if (!dianaAddress) {
        throw new Error('Endereço Diana não foi retornado pelo serviço externo');
      }

      // Atualiza ou cria um novo registro Diana com userId e dianaAddress obtido
      diana = await AddressModel.findOneAndUpdate(
        { userId },
        { $set: { dianaAddress } },
        { upsert: true, new: true }
      );
      console.log('Novo registro Diana criado ou atualizado:', diana);
    } else {
      console.log('Registro Diana já existe para userId:', userId);
    }

    // Retorna o dianaAddress para o frontend
    res.status(201).json({ dianaAddress: diana.dianaAddress });
  } catch (error) {
    console.error('Erro ao criar ou atualizar registro Diana:', error);
    res.status(500).json({ error: 'Falha ao criar ou atualizar registro Diana' });
  }
});

module.exports = router;