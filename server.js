import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt-nodejs'
import dotenv from 'dotenv'
import Product from './models/product'
import Accessory from './models/accessory'
import Clothing from './models/clothing'
import Jeans from './models/jeans'
import Shoes from './models/shoes'
import User from './models/user'
import Order from './models/order'
import productData from './data/productsLong.json'
import shoesData from './data/shoesLong.json'
import accessoriesData from './data/accessoriesLong.json'
import cloudinaryFramework from 'cloudinary'
import multer from 'multer'
import cloudinaryStorage from 'multer-storage-cloudinary'

const cloudinary = cloudinaryFramework.v2;
dotenv.config()

cloudinary.config({
  cloud_name: 'dciqrlzem', // this needs to be whatever you get from cloudinary
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = cloudinaryStorage({
  cloudinary,
  params: {
    folder: 'products',
    allowedFormats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 900, height: 900, crop: 'limit' }],
  },
})
const parser = multer({ storage })

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/finalAPI"
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})
mongoose.Promise = Promise

// Delete Seed-function? 
if (process.env.RESET_DB) {
  console.log('Resetting database...')

  const seedDatabase = async () => {
    // Clears database
    await Product.deleteMany({ createdByAdmin: true })

    // Saves all data from productsData, shoesData and accessoriesData to the database
    await productData.forEach(product => new Clothing(product).save())
    await shoesData.forEach(product => new Shoes(product).save())
    await accessoriesData.forEach(product => new Accessory(product).save())
  }
  seedDatabase()
}

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

// Messages
const PRODUCT_CREATED = 'Product created.'
const PRODUCT_UPDATED = 'Product updated.'
const USER_CREATED = 'User created.'
const USER_UPDATED = 'User updated.'
const USER_DELETED = 'User deleted.'
const ERR_INVALID_REQUEST = 'Invalid request.'
const ERR_NO_PRODUCTS = 'No products found.'
const ERR_NO_PAGE = 'No page found.'
const ERR_CREATE_PRODUCT = 'Could not create product.'
const ERR_UPDATE_PRODUCT = 'Could not update product.'
const ERR_CREATE_USER = 'Could not create user.'
const ERR_UPDATE_USER = 'Could not update user.'
const ERR_DELETE_USER = 'Could not delete user.'
const ERR_PLACE_ORDER = 'Could not place order.'

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

// Root endpoint listing endpoints and methods
app.get('/', (req, res) => {
  res.send(listEndpoints(app))
})

// All products
app.get('/products', async (req, res) => {
  const { page, createdByAdmin, featured, sort } = req.query
  // Pagination
  const pageNbr = +page || 1
  const perPage = 12
  const skip = perPage * (pageNbr - 1)

  const allProducts = await Product.find({
    createdByAdmin: createdByAdmin,
    featured: featured
  })
  const numProducts = allProducts.length
  const pages = Math.ceil(numProducts / perPage)

  // Sort
  const sortProducts = (sort) => {
    if (sort === 'high') return { price: -1 }
    else if (sort === 'low') return { price: 1 }
    else if (sort === 'newest') return { createdAt: -1 }
  }

  try {
    const products = await Product.find({
      createdByAdmin: createdByAdmin,
      featured: featured
    })
      .sort(sortProducts(sort))
      .limit(perPage)
      .skip(skip)
      .populate({
        path: 'seller',
        select: '_id name email',
      })
    if (numProducts === 0) {
      res.status(200).json({ message: ERR_NO_PRODUCTS })
    } else if (+page > pages) {
      res.status(404).json({ message: ERR_NO_PAGE })
    } else {
      res.status(200).json({
        total_pages: pages,
        page: pageNbr,
        products: products
      })
    }
  } catch (err) {
    res.status(400).json({
      message: ERR_INVALID_REQUEST,
      errors: err.error
    })
  }
})

// May be used if users should to be able to post own clothes for sale, has to be adapted to include cloudinary
app.post('/products', authenticateUser)
// Cloudinary middleware included here:
app.post('/products', parser.single('image'), async (req, res) => {
  const {
    name,
    description,
    price,
    category,
    size,
    userId
  } = req.body

  const seller = await User.findOne({ _id: userId })
  const imageUrl = req.file.path
  const imageId = req.file.filename

  let Schema

  if (category === 'Accessories') { Schema = Accessory }
  else if (category === 'Shoes') { Schema = Shoes }
  else if (category === 'Jeans') { Schema = Jeans }
  else { Schema = Clothing }

  try {
    const product = await new Schema({
      name,
      description,
      imageUrl,
      imageId,
      price,
      category,
      size,
      seller
    })
    product.save((err, product) => {
      if (product) {
        res.status(201).json({
          message: PRODUCT_CREATED,
          id: product._id,
          product: product
        })
      } else {
        res.status(400).json({
          message: ERR_CREATE_PRODUCT,
          errors: err.errors
        })
      }
    })
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $push: { products: product._id }
      }
    )
  } catch (err) {
    res.status(400).json({
      message: ERR_CREATE_PRODUCT,
      errors: err.errors
    })
  }
})

// Product detail page
app.get('/products/:productId', async (req, res) => {
  const { productId } = req.params

  try {
    const product = await Product.findOne({ _id: productId })
      .populate({
        path: 'seller',
        select: '_id name email',
      })
    res.status(200).json(product)
  } catch (err) {
    res.status(400).json({
      message: ERR_INVALID_REQUEST,
      errors: err.errors
    })
  }
})

// Sign up new user
app.post('/users', async (req, res) => {
  const {
    name,
    email,
    password,
    street,
    postcode,
    city,
    telephone
  } = req.body
  const encryptedPassword = bcrypt.hashSync(password)

  try {
    const user = new User({
      name,
      email,
      password: encryptedPassword,
      street,
      postcode,
      city,
      telephone
    })
    const newUser = await user.save()

    res.status(201).json({
      message: USER_CREATED,
      user: newUser
    })
  } catch (err) {
    res.status(400).json({
      message: ERR_CREATE_USER,
      errors: err.errors
    })
  }
})

// Profile page
app.get('/users/:userId', authenticateUser)
app.get('/users/:userId', async (req, res) => {
  const { userId } = req.params

  try {
    const user = await User.findOne({ _id: userId })
      .populate({
        path: 'orderHistory',
        select: 'items createdAt status',
        populate: {
          path: 'items',
          select: 'name price'
        }
      })
      .populate({
        path: 'products',
        select: 'name description createdAt sold'
      })

    res.status(200).json(user)
  } catch (err) {
    res.status(400).json({
      message: ERR_INVALID_REQUEST,
      errors: err.errors
    })
  }
})

// Edit profile page
app.put('/users/:userId', authenticateUser)
app.put('/users/:userId', async (req, res) => {
  const { userId } = req.params
  const {
    name,
    email,
    street,
    postcode,
    city,
    telephone
  } = req.body

  try {
    const user = await User.findOne({ _id: userId })
      .populate({
        path: 'orderHistory',
        select: 'items createdAt status',
        populate: {
          path: 'items',
          select: 'name price'
        }
      })

    if (user) {
      user.name = name
      user.email = email
      user.street = street
      user.postcode = postcode
      user.city = city
      user.telephone = telephone
      user.save()
      res.status(201).json({
        user: user,
        message: USER_UPDATED
      })
    } else {
      res.status(404).json({
        user: userId,
        message: ERR_UPDATE_USER
      })
    }
  } catch (err) {
    res.status(400).json({
      message: ERR_INVALID_REQUEST,
      errors: err.errors
    })
  }
})

// Update user product status
app.put('/users/:userId/products/:productId', authenticateUser)
app.put('/users/:userId/products/:productId', async (req, res) => {
  const { userId, productId } = req.params
  const {
    sold
  } = req.body

  try {
    const product = await Product.findOne({ _id: productId })

    if (product) {
      product.sold = sold
      product.save()
      const user = await User.findOne({ _id: userId })
        .populate({
          path: 'products',
          select: 'imageUrl name description createdAt sold'
        })
      res.status(201).json({
        product: product,
        userProducts: user.products,
        message: PRODUCT_UPDATED
      })
    } else {
      res.status(404).json({
        message: ERR_UPDATE_PRODUCT
      })
    }
  } catch (err) {
    res.status(400).json({
      message: ERR_INVALID_REQUEST,
      errors: err.errors
    })
  }
})

// Delete user
app.delete('/users/:userId', authenticateUser)
app.delete('/users/:userId', async (req, res) => {
  const { userId } = req.params
  try {
    await User.findByIdandRemove({ _id: userId })
      .then(user => {
        if (!user) {
          res.status(404).json({
            user: userId,
            message: ERR_DELETE_USER
          })
        }
        res.status(204).json({
          user: userId,
          message: USER_DELETED
        })
      })
  } catch (err) {
    res.status(400).json({
      message: ERR_INVALID_REQUEST,
      errors: err.errors
    })
  }
})

// Login existing user
app.post('/sessions', async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
    .populate({
      path: 'orderHistory',
      select: 'items createdAt status',
      populate: {
        path: 'items',
        select: 'name price'
      }
    })
    .populate({
      path: 'products',
      select: 'imageUrl name description createdAt sold'
    })

  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    res.json(user)
  } else {
    res.status(400).json({ notFound: true })
  }
})

// Post order / go to checkout
app.post('/orders', authenticateUser)
app.post('/orders', async (req, res) => {
  const {
    items,
    userId,
    name,
    street,
    postcode,
    city,
    telephone
  } = req.body

  try {
    const order = await new Order(req.body).save()

    items.forEach(async (item) => await Product.findOneAndUpdate(
      { _id: item },
      { $set: { sold: true } }
    ))

    await User.findOneAndUpdate(
      { _id: userId },
      { $push: { orderHistory: order._id } }
    )
    res.status(201).json(order)
  } catch (err) {
    res.status(400).json({
      message: ERR_PLACE_ORDER,
      errors: err.errors
    })
  }

})

// See order summary
// May only need this for dev purpose and not use in frontend as the users orders are included in /users/:userId
app.get('/orders/:orderId', authenticateUser)
app.get('/orders/:orderId', async (req, res) => {
  const { orderId } = req.params

  try {
    const order = await Order.findOne({ _id: orderId })
      .populate('items', 'name price')
    res.status(200).json(order)
  } catch (err) {
    res.status(400).json({
      message: ERR_INVALID_REQUEST,
      errors: err.errors
    })
  }

})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
