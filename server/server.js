require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Message = require("./models/Message");
const cors = require("cors");

const app = express();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

//  SOCKET AUTH
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;

    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

app.use(cors());
app.use(express.json());

app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
const users = {}; // userId -> socketId

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  if (socket.user?.id) {
    users[socket.user.id] = socket.id;
  }

  // SEND ONLINE USERS
  io.emit("onlineUsers", Object.keys(users));

  //  SEND MESSAGE
  socket.on("sendMessage", async (text, to) => {
    try {
      if (!text || !to) return;

      const newMessage = new Message({
        text,
        sender: socket.user.id,
        receiver: to,
      });

      let savedMessage = await newMessage.save();
      savedMessage = await savedMessage.populate("sender", "name");

      const receiverSocketId = users[to];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", savedMessage);
      }

      socket.emit("receiveMessage", savedMessage);

    } catch (error) {
      console.log(error);
    }
  });

  //  TYPING
  socket.on("typing", (to) => {
    const receiverSocketId = users[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", socket.user.id);
    }
  });

  socket.on("stopTyping", (to) => {
    const receiverSocketId = users[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", socket.user.id);
    }
  });

  //  DISCONNECT
  socket.on("disconnect", () => {
    delete users[socket.user?.id];
    io.emit("onlineUsers", Object.keys(users));
    console.log("User disconnected");
  });
});

server.listen(5000, () =>
  console.log("Server running on port 5000")
);