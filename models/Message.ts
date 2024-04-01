import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    roomId: String,
    userId: String,
    message: String,
    createdAt: { type: Date, default: Date.now },
});

export const Message = mongoose.model("Message", MessageSchema);