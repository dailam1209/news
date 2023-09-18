const User = require("../models/UserModule");
const Message = require("../models/MessageModule");
const RoomId = require("../models/RoomIdModule");
const io = require('socket.io')

// post message in room
exports.addMessage = async (req, res) => {
    const { message, roomId, receiver_id, sender_id  } = req.body;
    console.log(message, roomId, receiver_id, sender_id);
    try{
        if(message && receiver_id && sender_id && roomId) {
            // Xử lý kết nối từ máy khách
            io.on('connection', (socket) => {
                // Xử lý sự kiện khi có tin nhắn mới
                socket.on( roomId, (message) => {
                // Lưu tin nhắn vào cơ sở dữ liệu
                console.log("req.file.path", req.file.path);
                Message.create({
                    sender_id: sender_id,
                    receiver_id: receiver_id,
                    roomId: roomId,
                    message: message,
                    image: req?.file?.path
                })
                // Gửi tin nhắn đến các máy khách trong phòng chat
                io.to(roomId).emit('message', message);
                });
            });
        }
    }
         catch (err) {
            // socket.emit('messageError', { message: 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.' });
            res.status(500).json({
                success: false,
                message: err.message
            })
    }
}

// get profile user chated of customer
exports.getAllUserChat = async (req, res) => {
    const { id } = req.params;
    try {
        if(id) {
            const user = await User.findById(id);
            const listRoom = await user.roomId;
            if(listRoom) {
                res.status(200).json({
                    success: true,
                    message: listRoom
                })
            } 
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

