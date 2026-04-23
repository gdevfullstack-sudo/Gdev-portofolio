const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      default: null
    },
    avatar: {
      type: String,
      default: ""
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    provider: {
      type: String,
      enum: ["local", "google", "apple"],
      default: "local"
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
);

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    _id: this._id,
    username: this.username,
    email: this.email,
    avatar: this.avatar,
    isOnline: this.isOnline,
    createdAt: this.createdAt,
    provider: this.provider
  };
};

module.exports = mongoose.model("User", userSchema);
