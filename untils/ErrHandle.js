const ErrHandle = (message, statusCode, res) => {
    res.status(statusCode).json({
        success: false,
        message: message
    });
}

module.exports = ErrHandle;