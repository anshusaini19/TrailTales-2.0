const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);