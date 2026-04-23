const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000
    },
    imageUrl: {
      type: String,
      default: ""
    },
    isSeen: {
      type: Boolean,
      default: false
    },
    seenAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, isSeen: 1, createdAt: -1 });

messageSchema.pre("validate", function validateMessage(next) {
  if (!this.message && !this.imageUrl) {
    return next(new Error("A text message or image is required."));
  }

  next();
});

module.exports = mongoose.model("Message", messageSchema);
