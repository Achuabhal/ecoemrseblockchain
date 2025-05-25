import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  reciverac: { type: String },
  account: { type: String },
  category: { type: String },
});

export default model('Product', ProductSchema);
