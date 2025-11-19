import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  category: { type: String, required: true },
  condition: { type: String, enum: ['New', 'Good', 'Used'], default: 'Used' },
  priceType: { type: String, enum: ['Free', 'Exchange', 'Sell'], required: true },
  price: { type: Number, default: 0 },
  status: { type: String, enum: ['available', 'exchanged', 'sold'], default: 'available' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  town: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }
  }
}, { timestamps: true });

export const Item = mongoose.model('Item', itemSchema);
