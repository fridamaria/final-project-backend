import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt-nodejs'
import Product from './models/product'
import User from './models/user'
import Order from './models/order'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/finalAPI"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const authenticateUser = async (req, res, next) => {
  const user = await User.findOne({ accessToken: req.header('Authorization') })
  if (user) {
    req.user = user
    next()
  } else {
    res.status(401).json({ loggedOut: true })
  }
}

const port = process.env.PORT || 8080
const app = express()

const listEndpoints = require('express-list-endpoints')

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

// Root endpoint listing endpoints and methods
app.get('/', (req, res) => {
  res.send(listEndpoints(app))
})

app.get('/products', async (req, res) => {
  try {
    const products = await Product.find()
    res.status(200).json(products)
  } catch (err) {
    res.status(400).json({
      message: 'Invalid request.',
      errors: err.error
    })
  }
})

app.get('products/:productId', async (req, res) => {
  const { productId } = req.params

  try {
    const product = await Product.findOne({ _id: productId })
    res.status(200).json(product)
  } catch (err) {
    res.status(400).json({
      message: 'Invalid request.',
      errors: err.errors
    })
  }
})

app.post('/users', async (req, res) => {
  const { name, email, password } = req.body
  const encryptedPassword = bcrypt.hashSync(password)

  try {
    const user = new User({ name, email, password: encryptedPassword })
    const newUser = await user.save()

    res.status(201).json({
      message: 'User created.',
      userId: newUser._id,
      accessToken: newUser.accessToken
    })
  } catch (err) {
    res.status(400).json({
      message: 'Could not create user.',
      errors: err.errors
    })
  }
})

app.get('/users/:userId', authenticateUser)
app.get('/users/:userId', async (req, res) => {
  const { userId } = req.params

  try {
    const user = await User.findOne({ _id: userId })
      .populate('orderHistory', 'createdAt')

    res.status(200).json(user)
  } catch (err) {
    res.status(400).json({
      message: 'Invalid request.',
      errors: err.errors
    })
  }
})

app.put('/users/:userId', authenticateUser)
app.put('/users/:userId', async (req, res) => {
  const { userId } = req.params
  const { name, email, street, postcode, city, phone } = req.body

  try {
    const user = await User.findOne({ _id: userId })

    if (user) {
      user.name = name
      user.email = email
      user.street = street
      user.postcode = postcode
      user.city = city
      user.phone = phone
      user.save()
      res.status(201).json({ message: `User ${userId} updated.` })
    } else {
      res.status(404).json({
        message: 'Could not update user.'
      })
    }
  } catch (err) {
    res.status(400).json({
      message: 'Invalid request.',
      errors: err.errors
    })
  }
})

app.delete('/users/:userId', authenticateUser)
app.delete('/users/:userId', async (req, res) => {
  const { userId } = req.params
  try {
    await User.findByIdandRemove(userId)
      .then(user => {
        if (!user) {
          res.status(404).json({ message: `Could not delete user ${userId}.` })
        }
        res.status(204).json({ message: `User ${userId} deleted.` })
      })
  } catch (err) {
    res.status(400).json({
      message: 'Invalid request.',
      errors: err.errors
    })
  }
})

app.post('/sessions', async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    res.json({ userId: user._id, accessToken: user.accessToken })
  } else {
    res.status(400).json({ notFound: true })
  }
})

app.post('/orders', authenticateUser)
app.post('/orders', async (req, res) => {
  const { items, shipTo } = req.body
  const order = new Order(req.body)

  try {
    const order = await new Order({ items, shipTo }).save()
      .populate('items')
      .populate('shipTo')
    res.status(201).json(placedOrder)
  } catch (err) {
    res.status(400).json({
      message: 'Could not place order.',
      errors: err.errors
    })
  }

})

app.get('/orders/:orderId', authenticateUser)
app.get('/orders/:orderId', async (req, res) => {
  const { orderId } = req.params

  try {
    const order = await Order.findOne({ _id: orderId })
    res.status(200).json(order)
  } catch (err) {
    res.status(400).json({
      message: 'Invalid request.',
      errors: err.errors
    })
  }

})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
