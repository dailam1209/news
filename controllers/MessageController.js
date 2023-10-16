const User = require("../models/UserModule");
const Message = require("../models/MessageModule");
const RoomId = require("../models/RoomIdModule");
const io = require("socket.io");

exports.createMessage = async (req, res) => {
  try {
    const { reciever } = req.params;
    const { roomId } = req.body;
    const {
      text,
      system,
      createdAt,
      image,
      sent,
      received,
      seen,
      deleteAt,
      hiddenTo,
      isReply
    } = req.body.messages[0];
    const { name, avatar, _id } = req.body.messages[0].user;

    const message = {
      sender: req.user.id,
      reciever: reciever,
      roomId: roomId,
      messages: [
        {
          text: text,
          createdAt: createdAt,
          user: {
            _id: _id,
            name: name,
            avatar: avatar
          },
          image: image,
          system: system,
          sent: sent,
          received: received,
          seen: seen,
          deleteAt: deleteAt,
          hiddenTo: hiddenTo,
          isReply: isReply,
          reciever: reciever
        }
      ]
    };
    const checkHaveOline = await RoomId.findOne({ room_id: roomId });
    const isHave = checkHaveOline.listUserOnline?.includes(reciever);
    if (isHave) {
      message.seen = true;
    }
    const exitMessage = await Message.find({
      roomId: roomId
    });
    if (exitMessage.length == 0) {
      await Message.create(message);
      res.status(200).json({
        success: true,
        message: "Send message successfully.",
        showMessage: message
      });
    } else {
      await exitMessage[0].messages.push(message.messages[0]);
      await exitMessage[0].save();
      res.status(200).json({
        success: true,
        message: "Update message."
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const { idMessage } = req.params;
    const message = await Message.findById(idMessage);
    if (message) {
      await Message.findByIdAndUpdate(idMessage, req.body);
    }
    res.status(200).json({
      success: true,
      message: `Update message of ${idMessage} successfully.`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUrl = async (req, res) => {
  try {
    console.log("url", req.imageUrl);
    if (req.imageUrl) {
      res.status(200).json({
        success: true,
        image: req.imageUrl
      });
    } else {
      res.status(400).json({
        message: 'Please choose image again.'
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// get all message of room one
exports.getAllMessageOfRoom = async (req, res) => {
  try {
    const { idRoom } = req.params;
    const { fcmToken } = req.body;
    const findRoom = await RoomId.find({ room_id: idRoom });
    
    await RoomId.findByIdAndUpdate(findRoom[0]._id, {
      $push: { listUserOnline: req.user.id },
      $pull: { listUserOffline: fcmToken }
    });
    const roomUpdate = await RoomId.find({ room_id: idRoom });
      res.status(200).json({
        success: true,
        message: 'Post online or offline',
        listOffline: roomUpdate[0].listUserOffline
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

//find all message of other and check seen is true
exports.checkMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const idUser = req.user.id;
    const { limit, nextPage } = req.query;
    const message = await Message.findOne({ roomId: id });
    const lengthMessage = message.messages.length;

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin nhắn với roomId đã cung cấp.',
      });
    }

    // Lặp qua các tin nhắn và cập nhật trường 'seen' thành true
    await message.messages.forEach((msg) => {
      if (!msg.system && !msg.seen && msg.user._id.toString() !== idUser) {
        console.log(msg.user._id , idUser);
        msg.seen = true;
      }
    });

    // Lưu lại tài liệu đã được cập nhật
    await message.save();
    
    let limitMessage = [];
    console.log(Number(nextPage * limit) + Number(limit) );
    if((Number(nextPage * limit) + Number(limit))<= lengthMessage) {
      limitMessage = message.messages.slice(lengthMessage - 1 - ((nextPage * limit), lengthMessage - 1 - (nextPage * limit) + limit))
    } else if(Number(nextPage * limit) <= lengthMessage) {
      limitMessage = message.messages.slice(0 , lengthMessage - 1 - (nextPage * limit))
    } else {
      limitMessage = []
    };
    
    res.status(200).json({
      success: true,
      messages: limitMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
