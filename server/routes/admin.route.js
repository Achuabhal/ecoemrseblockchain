import express from 'express';
import { login1, login2 } from '../controllers/user.controller.js'; // Note the added .js extension
const router = express.Router();


router.post('/signup', (req, res, next) => {
    console.log('Router hit: GET /signup');
    next();
}, login1);


router.post('/lognin', login2);



export default router;
