

const sendToken = async (user, statusCode, res) => {
    let id = user._id;
    const token = user.getJwtToken(id);
    const refreshToken = user.getRefreshToken(id);
    user.refreshToken = refreshToken;
    user.expiresIn = new Date(Date.now() + 15 * 60 * 1000)
    await user.save();


    res.status(statusCode).cookie("token", token).json({
        success: true,
        user,
        token
    });
}

module.exports = sendToken;