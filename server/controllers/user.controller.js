import usermodel from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();

const secretKey = process.env.SECRET_KEY;



export const login1 = async (req, res) => {
    const { username, email, password } = req.body.params;
    console.log("Request body:", req.body); // Log the request body for debugging
    try {
        const userr = await usermodel.findOne({ username });
        if (!userr) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await usermodel.create({
                username,
                email,
                password: hashedPassword
            });
            res.status(200).json({ message: "User created", user: newUser });
           
            
        } else {
            res.status(400).json({ message: "User already exists" });
        }
    } catch (error) {
        res.status(500).json({ error: "Server eerror" });
    }
};

export const login2 = async (req, res) => {
    const { username, password } = req.body;
    console.log("Request body:", req.body); // Log the request body for debugging
    try {
        const userr = await usermodel.findOne({ username });
        if (userr) {
            const pass = await bcrypt.compare(password, userr.password);
            if (pass) {
                const token = jwt.sign({id: userr._id}, secretKey, { expiresIn: '60d' });
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 24 * 60 * 60 * 1000 // 60 days
                });

                res.status(200).json({ message: "Login successful" });
            } else {
                res.status(401).json({ message: "Invalid credentials" });
            }
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
