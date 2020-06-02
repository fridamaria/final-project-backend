import mongoose from 'mongoose'

const categories = ['Coats', 'Denim', 'Dresses', 'Jackets', 'Jumpsuits', 'Knitwear', 'Pants', 'Shorts', 'Skirts']
const sizes = ['XS', 'S', 'M', 'L', 'XL']

const Schema = mongoose.Schema

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30,
  },
  description: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 140,
  },
  imageUrl: {
    type: String,
    required: true
  },
  imageId: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: categories
  },
  size: {
    type: String,
    required: true,
    enum: sizes
  },
  price: {
    type: Number,
    required: true
  },
  featured: {
    type: Boolean,
    required: true,
    default: false
  },
  sold: {
    type: Boolean,
    required: true,
    default: false
  }
})

const Product = mongoose.model('Product', ProductSchema)

module.exports = Product