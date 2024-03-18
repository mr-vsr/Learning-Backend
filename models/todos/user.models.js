import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase:true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique:true
    },
    password: {
        type: String,
        required:[true, "Please enter your password!"]
    }
},
    { timestamps: true });

export const User = mongoose.model('User', UserSchema);
