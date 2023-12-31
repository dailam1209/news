const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const UserSchema = mongoose.Schema({
  role: { type: String, default: "user", required: false },
  username: { type: String, require: true },
  email: { type: String, require: true },
  image: { type: String, require: false },
  password: { type: String, require: true },
  phone: { type: String, require: false },
  code: { type: String, require: false, default: "" },
  isOnline: { type: Boolean, require: false, default: false},
  refreshToken: { type: String, require: true },
  fcmToken: { type: String, require: false, default: ''},
  roomId: [{ type: String, require: false }],
  onRoom:{ type: String, require: false ,default: ''},
  friendRequest: [
    {
      user: {type: mongoose.Schema.Types.ObjectId, ref: "User", require: true},
      createdAt: { type: Date, require: true, default: Date.now() }
    }
  ],
  countFriendRequest: {type: Number, require: false, default: 0},
  friend: [
    {
        type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],
  sentFriendRequest: [
    {
      user: {type: mongoose.Schema.Types.ObjectId, ref: "User" ,require: true},
      createdAt: { type: Date, require: true, default: Date.now() }
    },
  ],
  resetPasswordTime: {
    type: Date,
    required: false,
    default: ""
  },
  expiresIn: {
    type: Date,
    require: true
  },

  createAt: {
    type: Date,
    default: Date.now()
  },

});

// compare password
UserSchema.methods.comparePassword = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password);
};

// forgot password
UserSchema.methods.getResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordTime = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

/// jwt token
UserSchema.methods.getJwtToken = function (id) {
  return jwt.sign({ id: id }, process.env.JWT_SECRET_KEY, {
    expiresIn: Math.floor(Date.now() / 1000) + process.env.JWT_EXPIRES * 60
  });
};

/// jwt token
UserSchema.methods.getRefreshToken = function (id) {
  return jwt.sign({ id: id }, process.env.REFRESH_TOKEN_PRIVATE_KEY, {
    expiresIn: "30d"
  });
};

module.exports = mongoose.model("User", UserSchema);
