require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Message = require("./models/Message");
const cors = require("cors");

const app = express();

// =========================
// DB CONNECT
// =========================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// =========================
// SERVER
// =========================
const server = http.createServer(app);

// =========================
// SOCKET.IO
// =========================
const io = new Server(server, {
  cors: {
    origin: "https://chat-app-lyart-nine-76.vercel.app/login",
    methods: ["GET", "POST"],
  },
});

// =========================
// SOCKET AUTH (JWT)
// =========================
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

// =========================
// MIDDLEWARE
// =========================
app.use(cors());
app.use(express.json());

// =========================
// ROUTES
// =========================
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));

// =========================
// ONLINE USERS MAP
// =========================
const users = {}; // userId -> socketId

// =========================
// SOCKET EVENTS
// =========================
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const userId = socket.user?.id;

  // store user
  if (userId) {
    users[userId] = socket.id;
  }

  // send online users
  io.emit("onlineUsers", Object.keys(users));

  // =========================
  // SEND MESSAGE
  // =========================
  socket.on("sendMessage", async (data) => {
  try {
    const { text, image, to } = data;

    if (!to || (!text && !image)) return;

    const newMessage = new Message({
      text,
      image,
      sender: userId,
      receiver: to,
      status: "sent",
    });

    let savedMessage = await newMessage.save();

    savedMessage = await savedMessage.populate("sender", "name avatar");

    const receiverSocketId = users[to];

    if (receiverSocketId) {
      savedMessage.status = "delivered";
      await savedMessage.save();

      io.to(receiverSocketId).emit("receiveMessage", savedMessage);
    }

    socket.emit("receiveMessage", savedMessage);

  } catch (err) {
    console.log(err);
  }
});

  // =========================
  // MARK AS SEEN (REAL-TIME)
  // =========================
  socket.on("markSeen", async (fromUserId) => {
    try {
      await Message.updateMany(
        {
          sender: fromUserId,
          receiver: userId,
          status: { $ne: "seen" },
        },
        { status: "seen" }
      );

      const senderSocketId = users[fromUserId];

      //  notify sender instantly
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesSeen", {
          from: userId,
        });
      }

    } catch (err) {
      console.log(err);
    }
  });

  // =========================
  // TYPING
  // =========================
  socket.on("typing", (to) => {
    const receiverSocketId = users[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", userId);
    }
  });

  socket.on("stopTyping", (to) => {
    const receiverSocketId = users[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", userId);
    }
  });

  // =========================
  // DISCONNECT
  // =========================
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    if (userId) {
      delete users[userId];
    }

    io.emit("onlineUsers", Object.keys(users));
  });
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);