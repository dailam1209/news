const RoomId = require("../models/RoomIdModule");
const User = require("../models/UserModule");
const Message = require("../models/MessageModule");
const genercode = require("../untils/genercode");


// cần chỉnh lại chưa tối ưu(test)
exports.createRoom = async (req, res) => {
  const { typeRoom } = req.body;

  try {
    if (typeRoom === "") {
      const { senderId, receverId } = req.body;
      const getRoom1 = await RoomId.findOne({
        senderId: senderId,
        receverId: receverId
      });
      const getRoom2 = await RoomId.findOne({
        senderId: receverId,
        receverId: senderId
      });
      if (!getRoom1 && !getRoom2) {
        const room_id = genercode(24);
        await RoomId.create({
          room_id: room_id,
          senderId: senderId,
          receverId: receverId
        });
        await User.findByIdAndUpdate(senderId, {
          $push: { roomId: room_id }
        });

        await User.findByIdAndUpdate(receverId, {
          $push: { roomId: room_id }
        });

        res.status(200).json({
          success: true,
          message: `${room_id}`,
          id: `${room_id}`
        });
      } else {
        res.status(200).json({
          success: true,
          message: "Haved Room",
          id: getRoom1 ? getRoom1.room_id : getRoom2.room_id
        });
      }
    } else {
      const { arrayIdAdd, nameRoom } = req.body;
      const id = req.user.id
      arrayIdAdd.push(id);
      const room_id = genercode(24);
      await RoomId.create({
        room_id: room_id,
        senderId: id ,
        receverId: id,
        typeRoom: "group",
        imageRoom:
          "https://i.pinimg.com/564x/45/f5/ba/45f5ba70fbc9fd30a9e0eeb2cdb29656.jpg",
        nameRoom: nameRoom
      });
      await Promise.all(
        arrayIdAdd.map(async (id) => {
          await User.findByIdAndUpdate(id, {
            $push: { roomId: room_id }
          });
        })
      );
      res.status(200).json({
        success: true,
        message: `${room_id}`,
        id: `${room_id}`
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    await RoomId.findByIdAndDelete({ _id: id });
    res.status(200).json({
      success: true,
      message: "Delete successfully."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// left room 
exports.leftRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { fcmToken } = req.body;
    if(id) {
      await RoomId.findOneAndUpdate(
        { room_id : id },
        {
          $pull: { listUserOnline: req.user.id },
          $push: { listUserOffline: fcmToken }
        },
      );
    }
    res.status(200).json({
      success: true,
      message: 'Left success'
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
