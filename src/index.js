const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const { generateMessage, generateLinkMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));
app.use(express.json());

/*
socket.emit = specific user emit
io.emit = emit all
socket.broadcast.emit = emit all except user sending
io.to.emit = emits to all in specific room
socket.broadcast.to.emit = emits to all in specific room except user sending
*/

io.on('connection', (socket) => {

  socket.on('join', ({username, room}, callback) => {
    const {error, user} = addUser(socket.id, username, room);
    if(error) return callback(error);

    socket.join(user.room);
    socket.broadcast.to(user.room).emit('newMsg', generateMessage(`${user.username} has joined!`, 'Server'));
    io.to(user.room).emit('updateUsers', user.room, getUsersInRoom(user.room));
    callback();
  });

  socket.on('sendLocation', (lat, long, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit('newLinkMsg', generateLinkMessage(`https://google.com/maps?q=${lat},${long}`, user.username));
    callback();
  });

  socket.on('sendMsg', (msg, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit('newMsg', generateMessage(msg, user.username));
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if(user) {
      io.to(user.room).emit('newMsg', generateMessage(`${user.username} has left.`, 'Server'));
      io.to(user.room).emit('updateUsers', user.room, getUsersInRoom(user.room));
    }
  });
});


server.listen(port, () => {
  console.log('Server started at port: ' + port);
});
