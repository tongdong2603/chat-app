const express = require("express");
const path = require("path");
const http = require("http");
const Filter = require("bad-words");
const generateMessage = require("./utils/message");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", socket => {
  socket.emit("message", generateMessage("Welcome!"));
  socket.broadcast.emit("message", generateMessage("A new user has joined"));
  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }
    io.emit("message", generateMessage(message));
    callback();
  });
  socket.on("disconnect", () => {
    io.emit("message", generateMessage("A user has left"));
  });
  socket.on("sendLocation", (location, callback) => {
    io.emit(
      "locationMes",
      `https://google.com/maps?q=${location.latitude},${location.latitude}`
    );
    callback();
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port} !`);
});
