const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  btcAddress: { type: String, required: true, unique: true },
  solAddress: { type: String, required: true, unique: true },
  dogeAddress: { type: String, required: true, unique: true },
  dianaAddress: { type: String, required: true, unique: true },
}, {
  collection: 'exchangeAddress'
});

const AddressModel = mongoose.model('Address', addressSchema);

module.exports = AddressModel;
