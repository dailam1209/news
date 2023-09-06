const User = require("../models/UserModule");
const Message = require("../models/MessageModule");
const RoomId = require("../models/RoomIdModule");
const io = require('socket.io')

// create room
exports.createRoom = async (req, res) => {

    try {

        const { room_id } = req.body;
        const room = await RoomId.create({
            room_id
        })
        res.send({ message: 'Tạo phòng thành công'});
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
};

// post message in room
exports.addMessage = async (req, res) => {
    try{
        const { content, room_id, receiver_id, sender_id  } = req.body;
        if(content && receiver_id && sender_id && room_id) {
            // Xử lý kết nối từ máy khách
            io.on('connection', (socket) => {
                // Xử lý sự kiện khi có tin nhắn mới
                socket.on('message', (content) => {
                // Lưu tin nhắn vào cơ sở dữ liệu
                Message.create({
                    sender_id: sender_id,
                    receiver_id: receiver_id,
                    roomId: room_id,
                    content: content
                })
                // Gửi tin nhắn đến các máy khách trong phòng chat
                io.to(room_id).emit('message', content);
                });
            });
        }
    }
         catch (err) {
            socket.emit('messageError', { message: 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.' });
            res.status(500).json({
                success: false,
                message: err.message
            })
    }
}