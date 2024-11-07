const express = require('express');
const router = express.Router();
const axios = require('axios');
const mongoose = require('mongoose')
const AddressModel = require('../models/addressModel');

const url = 'mongodb+srv://btcex:dianalila@cluster0.y37vilu.mongodb.net/DianaExchange?retryWrites=true&w=majority';

router.post('/create_btc_address', async (req, res) => {
  const { userId } = req.body;

  try {
    console.log('Recebido POST em /create_btc_address!');
    console.log('userId:', userId);

    // Verifica se o userId foi fornecido
    if (!userId) {
      return res.status(400).json({ error: 'User ID é obrigatório' });
    }

    await mongoose.connect(url, {
    });
    console.log('Conectado ao MongoDB Atlas');

    // Verifica se já existe um registro BTC para o userId
    let btc = await AddressModel.findOne({ userId });
    console.log('Registro BTC encontrado:', btc);

    if (!btc || !btc.btcAddress) {
      // Envia a requisição POST para obter o btcAddress
      const { data } = await axios.post('https://btcaddressgen.onrender.com/btc_address_generator/', { userId });
      const btcAddress = data.btcaddress; // Verifique a estrutura da resposta do serviço externo

      // Verifica se o btcAddress foi retornado corretamente
      if (!btcAddress) {
        throw new Error('Endereço BTC não foi retornado pelo serviço externo');
      }

      // Atualiza ou cria um novo registro BTC com userId e btcAddress obtido
      btc = await AddressModel.findOneAndUpdate(
        { userId },
        { $set: { btcAddress } },
        { upsert: true, new: true }
      );
      console.log('Novo registro BTC criado ou atualizado:', btc);
    } else {
      console.log('Registro BTC já existe para userId:', userId);
    }

    // Retorna o btcAddress para o frontend
    res.status(201).json({ btcAddress: btc.btcAddress });
  } catch (error) {
    console.error('Erro ao criar ou atualizar registro BTC:', error);
    res.status(500).json({ error: 'Falha ao criar ou atualizar registro BTC' });
  }
});

module.exports = router;