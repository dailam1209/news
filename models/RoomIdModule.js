const mongoose = require("mongoose");

const RoomIdSchema = mongoose.Schema({
    room_id: { type: String, require: true},
    createAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model("RoomId", RoomIdSchema);