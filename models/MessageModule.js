const mongoose = require('mongoose');



const MessageSchema = mongoose.Schema({
    sender_id: {type: mongoose.Schema.Types.ObjectId, ref: "user", require: true },
    receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", require: true },
    roomId: { type: String, require: true},
    content: { type: String, require: true},
    createAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model("Message", MessageSchema);