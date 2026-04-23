const express = require("express");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");
const Message = require("../models/Message");

const router = express.Router();
const uploadDir = path.join(__dirname, "..", "..", "public", "uploads");
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${Date.now()}-${sanitized}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE_MB || 5) * 1024 * 1024
  },
  fileFilter(req, file, cb) {
    const extension = path.extname(file.originalname || "").toLowerCase();
    if (!file.mimetype.startsWith("image/") || !allowedExtensions.has(extension)) {
      return cb(new Error("Seules les images sont autorisees."));
    }

    cb(null, true);
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  return res.json({ user: req.user.toSafeObject() });
});

router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { username, avatar } = req.body;

    if (!username || username.trim().length < 2 || username.trim().length > 30) {
      return res.status(400).json({ message: "Le nom utilisateur est invalide." });
    }

    req.user.username = username.trim();
    req.user.avatar = (avatar || "").trim();
    await req.user.save();

    return res.json({ user: req.user.toSafeObject(), message: "Profil mis a jour." });
  } catch (error) {
    return res.status(500).json({ message: "Impossible de mettre a jour le profil." });
  }
});

router.post("/me/avatar", authMiddleware, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier recu." });
    }

    const avatar = `/uploads/${req.file.filename}`;
    req.user.avatar = avatar;
    await req.user.save();

    return res.json({ avatar, user: req.user.toSafeObject() });
  } catch (error) {
    return res.status(500).json({ message: "Impossible d'importer l'avatar." });
  }
});

router.get("/contacts", authMiddleware, async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const query = {
      _id: { $ne: req.user._id }
    };

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(query).sort({ isOnline: -1, username: 1 });
    return res.json({ users: users.map((user) => user.toSafeObject()) });
  } catch (error) {
    return res.status(500).json({ message: "Impossible de charger les contacts." });
  }
});

router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const conversationsRaw = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: currentUserId }, { receiverId: currentUserId }]
        }
      },
      {
        $addFields: {
          otherUserId: {
            $cond: [{ $eq: ["$senderId", currentUserId] }, "$receiverId", "$senderId"]
          }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$otherUserId",
          latestMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiverId", currentUserId] },
                    { $eq: ["$isSeen", false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { "latestMessage.createdAt": -1 } }
    ]);

    const userIds = conversationsRaw.map((conversation) => conversation._id);
    const users = await User.find({ _id: { $in: userIds } });
    const userMap = new Map(users.map((user) => [String(user._id), user]));

    const conversations = conversationsRaw
      .map((conversation) => {
        const user = userMap.get(String(conversation._id));
        const latestMessage = conversation.latestMessage;

        if (!user || !latestMessage) {
          return null;
        }

        return {
          user: user.toSafeObject(),
          lastMessage: latestMessage.imageUrl
            ? latestMessage.message || "Image envoyee"
            : latestMessage.message,
          imageUrl: latestMessage.imageUrl,
          lastMessageAt: latestMessage.createdAt,
          direction: String(latestMessage.senderId) === String(currentUserId) ? "out" : "in",
          unreadCount: conversation.unreadCount
        };
      })
      .filter(Boolean);

    return res.json({ conversations });
  } catch (error) {
    return res.status(500).json({ message: "Impossible de charger les conversations." });
  }
});

router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiverId: req.user._id,
      isSeen: false
    });

    return res.json({ unreadCount });
  } catch (error) {
    return res.status(500).json({ message: "Impossible de recuperer les messages non lus." });
  }
});

router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Utilisateur invalide." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    return res.json({ user: user.toSafeObject() });
  } catch (error) {
    return res.status(500).json({ message: "Impossible de charger ce profil." });
  }
});

module.exports = router;
