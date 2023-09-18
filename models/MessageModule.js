const mongoose = require('mongoose');



const MessageSchema = mongoose.Schema({
    sender_id: {type: mongoose.Schema.Types.ObjectId, ref: "User", require: true },
    receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true },
    roomId: { type: String, require: true},
    status: { type: String, require: true, default: 'pending'},
    message: { type: String, require: true, default: ''},
    image: { type: String, require: false, default: '' },
    createAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model("Message", MessageSchema);