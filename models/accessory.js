import mongoose from 'mongoose'
import Product from './product'

const Schema = mongoose.Schema

const Accessory = Product.discriminator('Accessory', new Schema({
  category: {
    type: String,
    required: true,
    enum: 'Accessories'
  }
}))

module.exports = mongoose.model('Accessory')