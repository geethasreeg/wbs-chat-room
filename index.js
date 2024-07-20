const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid'); // For generating unique room codes

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const MAX_USERS_PER_ROOM = 8;

const rooms = {}; // Stores room information

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

io.on('connection', (socket) => {
  let currentRoom = null;

  socket.on('createRoom', (username) => {
    const roomCode = uuidv4();
    rooms[roomCode] = { users: [], roomName: roomCode };
    socket.emit('roomCreated', roomCode);
  });

  socket.on('joinRoom', ({ roomCode, username }) => {
    if (rooms[roomCode] && rooms[roomCode].users.length < MAX_USERS_PER_ROOM) {
      rooms[roomCode].users.push(username);
      currentRoom = roomCode;
      socket.join(roomCode);
      socket.emit('joinSuccess', { roomCode, username });
      io.to(roomCode).emit('userCount', rooms[roomCode].users.length);
      io.to(roomCode).emit('chat message', `${username} has joined the room`);
    } else {
      socket.emit('joinFailure');
    }
  });

  socket.on('chat message', ({ roomCode, msg, username }) => {
    io.to(roomCode).emit('chat message', `${username}: ${msg}`);
  });

  socket.on('disconnect', () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].users = rooms[currentRoom].users.filter(user => user !== socket.username);
      io.to(currentRoom).emit('userCount', rooms[currentRoom].users.length);
      io.to(currentRoom).emit('chat message', `${socket.username} has left the room`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
