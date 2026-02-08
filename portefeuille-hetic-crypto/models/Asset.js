import mongoose from 'mongoose';

const AssetSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
 quantity: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Asset || mongoose.model('Asset', AssetSchema);