import mongoose from 'mongoose'
import Product from './product'

const Schema = mongoose.Schema
const clothingCategories = ['Coats', 'Dresses', 'Jackets', 'Jumpsuits', 'Knitwear', 'Pants', 'Shorts', 'Skirts', 'Tops']
const clothingSizes = ['XS', 'S', 'M', 'L', 'XL']

const Clothing = Product.discriminator('Clothing', new Schema({
  category: {
    type: String,
    required: true,
    enum: clothingCategories
  },
  size: {
    type: String,
    required: true,
    enum: clothingSizes,
  }
}))

module.exports = mongoose.model('Clothing')