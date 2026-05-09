require("dotenv").config();

const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
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
const PORT = process.env.PORT || 5000;
const onlineUsers = new Map();
const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  ...(process.env.NODE_ENV === "production" ? ["CLIENT_URL"] : [])
];
const insecureDefaults = new Set(["change-this-secret"]);
const clientOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowAnyOrigin = process.env.NODE_ENV !== "production" && clientOrigins.length === 0;
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowAnyOrigin || clientOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true
};
const io = new Server(server, {
  cors: {
    origin: allowAnyOrigin ? "*" : clientOrigins,
    methods: ["GET", "POST"]
  }
});

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
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://cdn.tailwindcss.com",
          "https://cdn.jsdelivr.net"
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://ui-avatars.com", "https://www.svgrepo.com"],
        mediaSrc: ["'self'", "blob:"],
        connectSrc: ["'self'", ...clientOrigins]
      }
    }
  })
);
app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authLimiter);
app.use(passport.initialize());

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
    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return;
    }

    const room = [userId, partnerId].sort().join(":");
    socket.join(room);
  });

  socket.on("message:send", async ({ receiverId, messageId }) => {
    if (!receiverId || !messageId) {
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId) || !mongoose.Types.ObjectId.isValid(messageId)) {
      return;
    }

    const savedMessage = await Message.findOne({
      _id: messageId,
      senderId: userId,
      receiverId
    });

    if (!savedMessage) {
      return;
    }

    const room = [userId, receiverId].sort().join(":");
    io.to(room).emit("message:new", savedMessage);

    const previewMessage =
      savedMessage.message ||
      (savedMessage.videoUrl ? "Video envoyee" : savedMessage.imageUrl ? "Photo envoyee" : "");

    const targetSockets = onlineUsers.get(receiverId);
    io.to(socket.id).emit("conversation:update", {
      from: socket.user.toSafeObject(),
      message: previewMessage,
      imageUrl: savedMessage.imageUrl,
      videoUrl: savedMessage.videoUrl,
      createdAt: savedMessage.createdAt
    });

    if (targetSockets?.size) {
      targetSockets.forEach((targetSocketId) => {
        io.to(targetSocketId).emit("conversation:update", {
          from: socket.user.toSafeObject(),
          message: previewMessage,
          imageUrl: savedMessage.imageUrl,
          videoUrl: savedMessage.videoUrl,
          createdAt: savedMessage.createdAt
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

    const weakSecrets = ["JWT_SECRET"].filter((key) => insecureDefaults.has(process.env[key]));
    if (weakSecrets.length > 0) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(`Secrets trop faibles: ${weakSecrets.join(", ")}`);
      }

      console.warn(
        `Avertissement: secrets faibles en environnement local (${weakSecrets.join(", ")}). ` +
          "Mettez a jour votre .env avant une mise en production."
      );
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
