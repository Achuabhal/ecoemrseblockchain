import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/admin.route.js';
import cookieParser from 'cookie-parser';
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());

// Connect to MongoDB Atlas

const mourl = process.env.MONGODB_URI;
mongoose.connect(mourl)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));



// API routes
app.use('/api', productRoutes);
app.use("/",adminRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
