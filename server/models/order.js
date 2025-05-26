import mongoose from 'mongoose';

// Define the schema for individual product items within the order
const productItemSchema = new mongoose.Schema({
    _id: { // This refers to the product's own ID from your data source
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        required: true,
        trim: true
    },
    account: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true
    }
}); // Mongoose will add its own _id to each subdocument in the array by default.
        // The `_id` field defined above is a property of the product item.

const orderSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    postalCode: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: false,
        trim: true,
        lowercase: true
    },
    sellerAddress: {
        type: String,
        required: false,
        trim: true
    },
    // Updated product field
    product: {
        type: [productItemSchema], // Defines an array of productItemSchema
        required: false,           // The array itself is not required
        default: []                // Defaults to an empty array if not provided
    }
});

export default mongoose.model('order', orderSchema);
