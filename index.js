const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const bodyParser = require('body-parser');
const cros = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const Message = require("./models/MessageModule")

const io = socketIo(server); 

// upload image
const cloudinary = require("./config/cloudinary");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
// Cấu hình CloudinaryStorage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'uploads', // Thay đổi tên thư mục tùy theo yêu cầu
    allowedFormats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
});
// Tạo middleware multer sử dụng CloudinaryStorage
const parser = multer({ storage: storage });


//router
const newApi = require("./routers/NewRouter");
const userApi = require("./routers/UserRouter");
const roomApi = require("./routers/RoomRouter");
const messageAPi = require("./routers/MessageRouter");

dotenv.config();
app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cros({
    origin: "http://localhost:8081/",
    method: "GET, POST, PUT, DELETE",
    Credential: true,
}));

mongoose.connect(
    process.env.MONGOOSE_URL).
    then(() => {
        console.log("DB success connection");
    })
    .catch((err) => {
        console.log(err);
    });

app.get('/', function(req, res) {
    res.render()
});

app.use("/api", newApi);
app.use('/upload', parser.single('avatar'), userApi);
app.use('', userApi);
app.use("/api", roomApi);
app.use('/api/add-message',parser.single('avatar'), async (req, res) => {
    const { message, roomId, receiver_id, sender_id  } = req.body;
    console.log(message, roomId, receiver_id, sender_id);
    try{
        if(message && receiver_id && sender_id && roomId) {
            // Xử lý kết nối từ máy khách
            io.on('connection', (socket) => {
                // Xử lý sự kiện khi có tin nhắn mới
                socket.on( roomId, (message) => {
                // Lưu tin nhắn vào cơ sở dữ liệu
                // Gửi tin nhắn đến các máy khách trong phòng chat
                io.to(roomId).emit('message', message);
            });
        });
        console.log("req.file.path", req.file.path);
        await Message.create({
            sender_id: sender_id,
            receiver_id: receiver_id,
            roomId: roomId,
            message: message,
            image: req?.file?.path,
            status: 'accepted'
        })

        res.status(200).json({
            success: true,
            message: 'Send message successfully!',
            status: 'accepted'
        })
        }
    }
         catch (err) {
            // socket.emit('messageError', { message: 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.' });
            res.status(500).json({
                success: false,
                message: err.message,
                status: 'rejected'
            })
    }
});
app.use("/api", messageAPi);


server.listen( process.env.PORT, () => {
    console.log(` Listenning to port ${process.env.PORT}`);
})