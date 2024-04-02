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


const port = 8080;

const allowedOrigins: string[] = [
  'https://multiplayer-frontend.vercel.app',
  'http://localhost:3000', 
];

// Express CORS middleware configuration for multiple origins


const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (origin)
        if (allowedOrigins.includes(origin) || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'), false);
        }
    },
    methods: ['GET', 'POST']
  }
});
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello from server!' });
});

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

    console.log('here', userId, roomPlayers[room].players[userId] === 1 ? 'X' : 'O')
    io.to(room).emit('roleAssigned', {role:roomPlayers[room].players[userId] === 1 ? 'X' : 'O', userId});
  });

  socket.on('message', ({ room, text, userId }) => {
    console.log('Message received');
    console.log('Room: ', room);
    console.log('Text: ', text);
    console.log('User: ', userId);
    io.to(room).emit('message', { text, userId });
    saveMessage(room, text, userId);
  });



  socket.on('move', ({ room, board, player }) => {
  
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



mongoose.connect(process.env.MONGO_URI as string).then(() => {
  console.log('Connected to MongoDB');
}
).catch(err => {
  console.log(err);
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}).on('error', (err) => {
  console.log(err);
});

