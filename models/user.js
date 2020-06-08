import mongoose from 'mongoose'
import crypto from 'crypto'

const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 1
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  street: {
    type: String,
    required: true
  },
  postcode: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  telephone: {
    type: Number,
    required: true,
  },
  orderHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString('hex')
  }
})

const User = mongoose.model('User', UserSchema)

module.exports = User