const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");


const UserSchema = mongoose.Schema({
    role: { type: String, default: "user", required: false},
    username: { type: String, require: true },
    email: { type: String, require: true},
    image: { type: String, require: false},
    password: { type: String, require: true},
    phone: { type: String, require: false},
    code: {type: String, require: false, default: ""},
    refreshToken: { type: String, require: true},
    roomId: [
       { type: mongoose.Schema.Types.ObjectId, require: false}],
    friendRequest: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    friend: [{
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    }],
    sentFriendRequest: [{
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    }],
    resetPasswordTime: {
        type: Date,
        required: false,
        default: ""
    },
    createAt: {
        type: Date,
        default: Date.now()
    }
});

// compare password
UserSchema.methods.comparePassword = async function (enterPassword) {
    return await bcrypt.compare(enterPassword, this.password);
}


// forgot password
UserSchema.methods.getResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256")
                                    .update(resetToken)
                                    .digest("hex");

    this.resetPasswordTime = Date.now() + 15 * 60 * 1000;
    return resetToken;
}


/// jwt token
UserSchema.methods.getJwtToken =  function (id) {

    return jwt.sign({ id: id}, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
        expiresIn: "1d" 
    });
};

/// jwt token
UserSchema.methods.getRefreshToken =  function (id) {

    return jwt.sign(
        { id: id},
        process.env.REFRESH_TOKEN_PRIVATE_KEY,
        { expiresIn: "30d" }
    );
}

module.exports = mongoose.model("User", UserSchema);