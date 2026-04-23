const express = require("express");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const authMiddleware = require("../middleware/auth");
const Message = require("../models/Message");
const User = require("../models/User");

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

router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Conversation invalide." });
    }

    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: userId },
        { senderId: userId, receiverId: req.user._id }
      ]
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      {
        senderId: userId,
        receiverId: req.user._id,
        isSeen: false
      },
      {
        $set: {
          isSeen: true,
          seenAt: new Date()
        }
      }
    );

    return res.json({
      recipient: otherUser.toSafeObject(),
      messages: messages.map((message) => {
        if (
          String(message.senderId) === String(userId) &&
          String(message.receiverId) === String(req.user._id)
        ) {
          return {
            ...message.toObject(),
            isSeen: true,
            seenAt: message.seenAt || new Date()
          };
        }

        return message;
      })
    });
  } catch (error) {
    return res.status(500).json({ message: "Impossible de charger les messages." });
  }
});

router.post("/", authMiddleware, (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message || "Upload invalide." });
    }

    return next();
  });
}, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const trimmedMessage = (message || "").trim();
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    if (!receiverId || (!trimmedMessage && !imageUrl)) {
      return res.status(400).json({ message: "Destinataire et contenu obligatoires." });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Destinataire invalide." });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Destinataire introuvable." });
    }

    const createdMessage = await Message.create({
      senderId: req.user._id,
      receiverId,
      message: trimmedMessage,
      imageUrl
    });

    return res.status(201).json({ message: createdMessage });
  } catch (error) {
    return res.status(500).json({ message: "Impossible d'envoyer le message." });
  }
});

router.patch("/seen/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Utilisateur invalide." });
    }

    await Message.updateMany(
      {
        senderId: userId,
        receiverId: req.user._id,
        isSeen: false
      },
      {
        $set: {
          isSeen: true,
          seenAt: new Date()
        }
      }
    );

    return res.json({ message: "Messages marques comme lus." });
  } catch (error) {
    return res.status(500).json({ message: "Impossible de mettre a jour les messages." });
  }
});

module.exports = router;
