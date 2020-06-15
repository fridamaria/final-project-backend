import mongoose from 'mongoose'
import Product from './product'

const Schema = mongoose.Schema
const jeansSizes = [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38]

const Jeans = Product.discriminator('Jeans', new Schema({
  category: {
    type: String,
    required: true,
    enum: 'Jeans'
  },
  size: {
    type: String,
    required: true,
    enum: jeansSizes
  }
}))

module.exports = mongoose.model('Jeans')