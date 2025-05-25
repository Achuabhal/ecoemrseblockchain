import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'; // Adjust the import to your user model's path
import dotenv from 'dotenv';


dotenv.config();

const secretKey = process.env.SECRET_KEY;

export const protect = async (req, res, next) => {
    try {
        // Extract the token from cookies
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token provided' });
        }

        // Verify the token
        const decoded = jwt.verify(token, secretKey);

        // Retrieve the user from the database
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        // Attach the user to the request object
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};
