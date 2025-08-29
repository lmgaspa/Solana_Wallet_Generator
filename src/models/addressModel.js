// src/models/addressModel.js (corrigido)
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // mantenha só isso

  btcAddress:   { type: String, default: null },
  solAddress:   { type: String, default: null },
  dogeAddress:  { type: String, default: null },
  dianaAddress: { type: String, default: null }
}, {
  collection: 'exchangeAddress',
  timestamps: true,
});

// NÃO defina index pro userId aqui (já tem unique no campo)

// Índices únicos condicionais para as moedas:
addressSchema.index({ btcAddress: 1 },   { unique: true, partialFilterExpression: { btcAddress: { $type: 'string' } } });
addressSchema.index({ solAddress: 1 },   { unique: true, partialFilterExpression: { solAddress: { $type: 'string' } } });
addressSchema.index({ dogeAddress: 1 },  { unique: true, partialFilterExpression: { dogeAddress: { $type: 'string' } } });
addressSchema.index({ dianaAddress: 1 }, { unique: true, partialFilterExpression: { dianaAddress: { $type: 'string' } } });

module.exports = mongoose.model('Address', addressSchema);
