const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./utils/message");
const {
  getUser,
  getUsersInRoom,
  removeUser,
  addUser
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", socket => {
  console.log("a new client connection");

  socket.on("join", (options, callback) => {
    console.log("options: ", options);
    const { error, user } = addUser({ id: socket.id, ...options });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome!!!"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage("Admin",`${user.username} has joined`));
    callback();
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    })
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.emit(
        "message",
        generateMessage("Admin" , `${user.username} has left`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  });
  socket.on("sendLocation", (location, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMes",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${location.latitude},${location.latitude}`
      )
    );
    callback();
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port} !`);
});
