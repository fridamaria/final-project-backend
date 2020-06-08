import mongoose from 'mongoose'
import Product from './product'

const Schema = mongoose.Schema
const shoeSizes = [36, 37, 38, 39, 40, 41, 42]

const Shoes = Product.discriminator('Shoes', new Schema({
  category: {
    type: String,
    required: true,
    enum: 'Shoes'
  },
  size: {
    type: String,
    required: true,
    enum: shoeSizes
  }
}))

module.exports = mongoose.model('Shoes')