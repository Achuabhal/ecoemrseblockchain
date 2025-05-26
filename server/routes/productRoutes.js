import express from 'express';
import Product from '../models/Product.js';
import {protect} from "../controllers/jwt.js";
import order from '../models/order.js';

const router = express.Router();

// GET all products
router.get('/',  async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});



// POST create a new product
router.post('/', async (req, res) => {
  const { name, description, price, imageUrl, account,category } = req.body;
  try {
    const newProduct = new Product({ name, description, price, imageUrl, account,category });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
});

router.get('/account', async (req, res) => {
  const { account } = req.query;
  try {
    const products = await Product.find({ account });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post("/product", async (req, res) => {
  
  const { account } = req.body;
  console.log(account)
  try {
   var result = await Product.findOne({ account });

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
});

router.post("/order", async (req, res) => {
  
  const {
  firstName,
  lastName, 
  address, 
  city, 
  postalCode, 
  email,
  sellerAddress,
  product
  } = req.body;

  try {
  const newOrder = new order({
    firstName,
    lastName,
    address,
    city,
    postalCode,
    email,
    sellerAddress,
    product
  });
  await newOrder.save();
  res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
  console.error("Error processing order:", error);
  res.status(500).json({ message: 'Server error while processing order', error });
  }
});


router.get('/orders', async (req, res) => {
  try {
    console.log("Fetching orders...");
    const orders = await order.find().populate('product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;
