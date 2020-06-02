import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import crypto from 'crypto'
import bcrypt from 'bcrypt-nodejs'
import Product from './models/product'
import { restart } from 'nodemon'

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
    res.status(400).json({ message: 'Invalid request', errors: err.errors })
  }
})

app.get('products/:productId', async (req, res) => {
  const { productId } = req.params

  try {
    const product = await Product.findOne({ _id: productId })
    res.status(200).json(product)
  } catch (err) {
    res.status(400).json({ message: 'Invalid request', errors: err.errors })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
