const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    sender: {
      type: String,
      ref: "User"
    }, //sender_id
    reciever: {
      type: String,
      ref: "User"
    }, //reciever_id
    roomId: { type: String, require: true },
    messages: [
      {
        _id: String, //message_id
        text: String, //message_content
        createdAt: String, //message_creation_time
        user: {
          _id: String, //sender_id
          name: String, //sender_name
          avatar: String //sender_photo
        },
        image: String, //message_image_content
        sent: Boolean,
        received: Boolean,
        seen: Boolean,
        deleteAt: Date,
        hiddenTo: {
          type: Array,
          default: []
        },
        isReply: Object // Store here un object like: { text:'Reply to a message', name: 'Axel' }
      }
    ],
    createAt: {
      type: Date,
      default: Date.now()
    }
  },
  {
    strict: false //There may be some problems in type casting. So disable strict mode.
  }
);

module.exports = mongoose.model("Message", MessageSchema);