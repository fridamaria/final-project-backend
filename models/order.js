import mongoose from 'mongoose'

const Schema = mongoose.Schema

const OrderSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  items: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
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
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped'],
    default: 'Pending'
  }
})

const Order = mongoose.model('Order', OrderSchema)

module.exports = Order