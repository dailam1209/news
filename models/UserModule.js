const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");


const UserSchema = mongoose.Schema({
    username: { type: String, require: true },
    email: { type: String, require: true},
    image: { type: String, require: false},
    password: { type: String, require: true},
    code: {type: String, require: false},
    refreshToken: { type: String, require: true},
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
        expiresIn: "14m" 
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