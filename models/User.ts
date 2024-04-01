import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    userId: String,
    createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);