import mongoose from 'mongoose'

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
    minlength: 8
  },
  address: {
    street: {
      type: String
    },
    postcode: {
      type: Number
    },
    city: {
      type: String
    }
  },
  phone: {
    type: Number
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString('hex')
  }
})

const User = mongoose.model('User', UserSchema)

module.exports = User