const express = require('express');
const router = express.Router();
const axios = require('axios');
const mongoose = require('mongoose');
const AddressModel = require('../models/addressModel');

const url = 'mongodb+srv://btcex:dianalila@cluster0.y37vilu.mongodb.net/DianaExchange?retryWrites=true&w=majority';

router.post('/create_doge_address', async (req, res) => {
  const { userId } = req.body;

  try {
    console.log('Recebido POST em /create_doge_address!');
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

    if (!addressRecord.dogeAddress) {
      const { data } = await axios.post('https://btcaddressgen.onrender.com/doge_address_generator/', { userId });
      console.log('Resposta da API externa:', data);

      const dogeAddress = data.dogeAddress; // Correção da chave

      if (!dogeAddress) {
        throw new Error('Endereço Dogecoin não foi retornado pelo serviço externo');
      }

      addressRecord = await AddressModel.findOneAndUpdate(
        { userId: userId },
        { $set: { dogeAddress: dogeAddress } },
        { upsert: true, new: true }
      );
      console.log('Novo registro Dogecoin criado ou atualizado:', addressRecord);
    } else {
      console.log('Registro Dogecoin já existe para userId:', userId);
    }

    res.status(201).json({ dogeAddress: addressRecord.dogeAddress });
  } catch (error) {
    console.error('Erro ao criar ou atualizar registro Dogecoin:', error);
    res.status(500).json({ error: 'Falha ao criar ou atualizar registro Dogecoin' });
  }
});

module.exports = router;