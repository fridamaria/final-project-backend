import mongoose from 'mongoose'

const Schema = mongoose.Schema
const options = {
  discriminatorKey: 'type'
}

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
    required: false
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
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdByAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, options)

const Product = mongoose.model('Product', ProductSchema)

module.exports = Product