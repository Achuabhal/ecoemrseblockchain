// user.model.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,  // corrected
    },
    email: {
        type: String,
        required: true,  // corrected
    },
    password: {
        type: String,
        required: true,  // corrected
    },
});

const usermodel = mongoose.model("user", userSchema);
export default usermodel;
