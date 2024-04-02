import express from 'express';
import { Room } from '../models/Room';
import { Message } from '../models/Message';
const router = express.Router();

router.post('/create', async (req, res) => {

    const { roomId, userId } = req.body;

    try {
        let room = await Room.findOne({ roomId });

        if (!room) {
            room = new Room({ roomId, userIds: [userId] });
        }
        else {
            if (!room.userIds.includes(userId)) {
                room.userIds.push(userId);
            }
        }

        await room.save();
        res.status(200).json({ message: 'Room created successfully' });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }

})

router.post('/add', async (req, res) => {
    const { roomId, userId } = req.body;

    try {
        let room = await Room.findOne({roomId});
        if (room) {
            if (!room.userIds.includes(userId)) {
                room.userIds.push(userId);
                await room.save();
                res.status(200).json({ message: 'User added to room' });
            }
            else {
                res.status(200).json({ message: 'User already in room' });
            }
        }
    }
    catch (err) {
        console.log(err);

        res.status(500).json({ message: 'Internal server error' });
    }
})

router.get('/messages', async (req, res) => {
    const { roomId } = req.query;

    try {
        let messages = await Message.find({ roomId });
        console.log(messages);
        res.status(200).json({ messages });
    }
    catch (err) {
        console.log(err);

        res.status(500).json({ message: 'Internal server error' });
    }

});



export default router;
