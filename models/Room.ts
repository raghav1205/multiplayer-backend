import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
    roomId: String,
    userIds: [String],
    createdAt: { type: Date, default: Date.now },
});

export const Room = mongoose.model("Room", RoomSchema);
