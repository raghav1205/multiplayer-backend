import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose, { mongo } from 'mongoose';
import room from './routes/room';
import user from './routes/user';
import { Message } from './models/Message';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
const port = 8080;

app.use(cors());
app.use(express.json());
app.use('/user', user);
app.use('/room', room);

type PlayerRole = 1 | 2;

const roomPlayers: { [key: string]: { players: { [key: string]: PlayerRole } } } = {};
io.on('connection', (socket) => {

  console.log('a user connected');


  socket.on('createRoom', ({ room, userId }) => {
    socket.join(room);
    console.log(`Room ${room} created`);
  });

  socket.on('joinRoom', ({ room, userId }) => {


    socket.join(room);
    console.log(`Joined room ${room}`);
    console.log(roomPlayers)
    // const role = roomPlayers[room]?.count % 2 === 0 ? 2 : 1;
    if (!roomPlayers[room]) {
      roomPlayers[room] = { players: { [userId]: 1 } }
      console.log("Player 1 joined")
    }
    else {
      if (!roomPlayers[room].players[userId]) {
        // If the user has not been assigned a role, assign them a role based on the number of players in the room
     
        roomPlayers[room].players[userId] = 2;
        console.log("Player 2 joined")
      }
    }
    console.log(roomPlayers);

    // Emit the role to the client

    io.to(room).emit('roleAssigned', roomPlayers[room].players[userId] === 1 ? 'X' : 'O');
  });

  socket.on('message', ({ room, text, userId }) => {
    io.to(room).emit('message', { text, userId });
    saveMessage(room, text, userId);
  });

  // socket.on('player', (room) => {
  //   console.log('Player joined');
  //   if (roomPlayers[room].count  % 2 === 0) {
  //     io.to(room).emit('player', 'X');
  //     console.log("emitted  X")
  //   }
  //   else {
  //     io.to(room).emit('player', 'O');
  //     console.log("emitted O")
  //   }
  // });


  socket.on('move', ({ room, board, player }) => {
    // console.log('Move made');
    // console.log("Room: ", room);
    // console.log("Board: ", board);
    // console.log("Player: ", player);
    io.to(room).emit('move', { board, player });
  });


});

const saveMessage = async (roomId: string, text: string, userId: string) => {
  const message = new Message({ roomId, message: text, userId, createdAt: new Date() });
  try {
    await message.save();
    console.log('Message saved');
  }
  catch (err) {
    console.log(err);
  }

};


app.get('/', (req, res) => {
  res.json({ message: 'Hello from server!' });
});



server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

mongoose.connect(process.env.MONGO_URI as string).then(() => {
  console.log('Connected to MongoDB');
}
).catch(err => {
  console.log(err);
});
