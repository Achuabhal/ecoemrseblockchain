import express from 'express';
import Product from '../models/Product.js';
import {protect} from "../controllers/jwt.js";

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

export default router;
