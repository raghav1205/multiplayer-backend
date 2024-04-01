import express from 'express';
import { User } from '../models/User';
const router = express.Router();

router.post('/create', async (req, res) => {
    console.log(req.body)
    const { username, userId } = req.body;
    try {

        let userExists = await User.findOne({ username });
        if (userExists) {
           return  res.status(200).json({ message: 'Username already exists' });
        }
        let user = await User.findOne({ userId });
        if (!user) {
            user = new User({ username, userId });
            await user.save();
            return res.status(200).json({ message: 'User created successfully' });
        }
        else {
           return res.status(200).json({ message: 'User already exists' });
        }
    }
    catch (err) {
       return  res.status(500).json({ message: 'Internal server error' });
    }
})


export default router;
