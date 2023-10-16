const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }, //sender_id
    reciever: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }, //reciever_id
    roomId: { type: String, require: true },
    messages: [
      {
        system: {type: Boolean, require: false, default: false},
        text:{ type: String, require: false, default: ''}, //message_content
        createdAt: { type: Date, require: true}, //message_creation_time
        user: {
          _id: { type: mongoose.Schema.Types.ObjectId,
            ref: "User", require: true}, //sender_id
          name: { type: String, require: true, default: ''}, //sender_name
          avatar: { type: String, require: true, default: ''} //sender_photo
        },
        image:{ type: String, require: false, default: ''}, //message_image_content
        sent: {type: Boolean, require: true, default: true},
        received:{type: Boolean, require: true, default: false},
        seen: { type: Boolean, require: true, default: false},
        deleteAt: { type: Date, require: false, default:''},
        hiddenTo: {
          type: Array,
          default: []
        },
        isReply: { text: {type: String, require: false, default: ''}, 
                    name: { type: String, require: false, default: ''} }, // Store here un object like: { text:'Reply to a message', name: 'Axel' }
        reciever: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", require: true
        }
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