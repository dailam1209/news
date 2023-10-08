const mongoose = require("mongoose");

const RoomIdSchema = mongoose.Schema({
    room_id: { type: String, require: true},
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" ,require: false },
    receverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" ,require: false },
    typeRoom:{ type: String, require: false, default: ''},
    imageRoom: {type: String, require: false, default: ''},
    nameRoom:{type: String, require: false, default: ''}, 
    listUserOnline: [
        {
            type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        }
    ],
    listUserOffline:[
        {
            type: String,
        }
    ],
    createAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model("RoomId", RoomIdSchema);