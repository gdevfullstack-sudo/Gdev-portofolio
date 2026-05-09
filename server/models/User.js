const mongoose = require("mongoose");
const { randomInt } = require("crypto");

function generateStudentId() {
  return `ES${randomInt(100000, 1000000)}`;
}

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
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
);

userSchema.pre("save", async function(next) {
  if (!this.studentId) {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = generateStudentId();
      const existing = await mongoose.model("User").findOne({ studentId: candidate });
      if (!existing) {
        this.studentId = candidate;
        return next();
      }
    }

    return next(new Error("Unable to generate a unique student ID."));
  }

  next();
});

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    _id: this._id,
    username: this.username,
    email: this.email,
    avatar: this.avatar,
    isOnline: this.isOnline,
    createdAt: this.createdAt,
    provider: this.provider,
    studentId: this.studentId
  };
};

module.exports = mongoose.model("User", userSchema);
