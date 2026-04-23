require("dotenv").config();

const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");
const User = require("./models/User");
const Message = require("./models/Message");
const { router: authRoutes, passport } = require("./routes/auth");
const userRoutes = require("./routes/user");
const messageRoutes = require("./routes/message");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;
const onlineUsers = new Map();
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "SESSION_SECRET"];
const insecureDefaults = new Set(["change-this-secret", "change-this-session-secret"]);
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Trop de tentatives. Reessayez dans quelques minutes." }
});

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authLimiter);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, app: "ESTIM Chat" });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "login.html"));
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;
    return next();
  } catch (error) {
    return next(new Error("Authentication error"));
  }
});

io.on("connection", async (socket) => {
  const userId = socket.user._id.toString();
  const sockets = onlineUsers.get(userId) || new Set();
  const wasOffline = sockets.size === 0;
  sockets.add(socket.id);
  onlineUsers.set(userId, sockets);

  if (wasOffline) {
    await User.findByIdAndUpdate(userId, { isOnline: true });
    io.emit("users:online", { userId, isOnline: true });
  }

  socket.on("join:conversation", ({ partnerId }) => {
    const room = [userId, partnerId].sort().join(":");
    socket.join(room);
  });

  socket.on("message:send", async ({ receiverId, message, imageUrl, messageId, createdAt }) => {
    const trimmedMessage = (message || "").trim();

    if (!receiverId || (!trimmedMessage && !imageUrl)) {
      return;
    }

    const room = [userId, receiverId].sort().join(":");
    io.to(room).emit("message:new", {
      _id: messageId || `${Date.now()}`,
      senderId: userId,
      receiverId,
      message: trimmedMessage,
      imageUrl: imageUrl || "",
      isSeen: false,
      createdAt: createdAt || new Date().toISOString()
    });

    const targetSockets = onlineUsers.get(receiverId);
    io.to(socket.id).emit("conversation:update", {
      from: socket.user.toSafeObject(),
      message: trimmedMessage || "Image envoyee",
      imageUrl: imageUrl || "",
      createdAt: createdAt || new Date().toISOString()
    });

    if (targetSockets?.size) {
      targetSockets.forEach((targetSocketId) => {
        io.to(targetSocketId).emit("conversation:update", {
          from: socket.user.toSafeObject(),
          message: trimmedMessage || "Image envoyee",
          imageUrl: imageUrl || "",
          createdAt: createdAt || new Date().toISOString()
        });
      });
    }
  });

  socket.on("message:seen", async ({ senderId }) => {
    if (!senderId) {
      return;
    }

    await Message.updateMany(
      {
        senderId,
        receiverId: userId,
        isSeen: false
      },
      {
        $set: {
          isSeen: true,
          seenAt: new Date()
        }
      }
    );

    const targetSockets = onlineUsers.get(senderId);
    if (targetSockets?.size) {
      targetSockets.forEach((targetSocketId) => {
        io.to(targetSocketId).emit("message:seen:update", {
          byUserId: userId
        });
      });
    }
  });

  socket.on("typing:start", ({ receiverId }) => {
    const targetSockets = onlineUsers.get(receiverId);
    if (targetSockets?.size) {
      targetSockets.forEach((targetSocketId) => {
        io.to(targetSocketId).emit("typing:update", {
          fromUserId: userId,
          isTyping: true
        });
      });
    }
  });

  socket.on("typing:stop", ({ receiverId }) => {
    const targetSockets = onlineUsers.get(receiverId);
    if (targetSockets?.size) {
      targetSockets.forEach((targetSocketId) => {
        io.to(targetSocketId).emit("typing:update", {
          fromUserId: userId,
          isTyping: false
        });
      });
    }
  });

  socket.on("disconnect", async () => {
    const userSockets = onlineUsers.get(userId);
    if (!userSockets) {
      return;
    }

    userSockets.delete(socket.id);

    if (userSockets.size === 0) {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false });
      io.emit("users:online", { userId, isOnline: false });
      return;
    }

    onlineUsers.set(userId, userSockets);
  });
});

async function startServer() {
  try {
    const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
    if (missingEnvVars.length > 0) {
      throw new Error(`Variables manquantes: ${missingEnvVars.join(", ")}`);
    }

    const weakSecrets = ["JWT_SECRET", "SESSION_SECRET"].filter((key) =>
      insecureDefaults.has(process.env[key])
    );
    if (weakSecrets.length > 0) {
      throw new Error(`Secrets trop faibles: ${weakSecrets.join(", ")}`);
    }

    await mongoose.connect(process.env.MONGO_URI);
    server.listen(PORT, () => {
      console.log(`ESTIM Chat en ligne sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Erreur de demarrage:", error.message);
    process.exit(1);
  }
}

startServer();
