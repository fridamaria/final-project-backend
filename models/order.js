import mongoose from 'mongoose'

const Schema = mongoose.Schema

const OrderSchema = new Schema({
  items: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  shipTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

const Order = mongoose.model('Order', OrderSchema)

module.exports = Order