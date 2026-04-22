const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  phone: String,
  address: String,
  rating: Number,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  lastSynced: { type: Date, default: Date.now }
});

serviceProviderSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);
