const express = require("express");
const http = require("http");
const socketIo = require("socket.io")
const app = express();
const server = http.createServer(app);
const bodyParser = require("body-parser");
const cros = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { userJoinGroup, getCurrentUserDetails, userLeaveGroup } = require('./untils/userSocket')

const Message = require("./models/MessageModule");

const io = socketIo(server);

// upload image
const cloudinary = require("./config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
// Cấu hình CloudinaryStorage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: "uploads", // Thay đổi tên thư mục tùy theo yêu cầu
  allowedFormats: ["jpg", "png", "jpeg"],
  transformation: [{ width: 500, height: 500, crop: "limit" }]
});
// Tạo middleware multer sử dụng CloudinaryStorage
const parser = multer({ storage: storage });

//router
const newApi = require("./routers/NewRouter");
const userApi = require("./routers/UserRouter");
const roomApi = require("./routers/RoomRouter");
const messageAPi = require("./routers/MessageRouter");

dotenv.config();
app.set("view engine", "ejs");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cros({
    origin: "http://localhost:8081",
    method: "GET, POST, PUT, DELETE",
    Credential: true
  })
);

mongoose
  .connect(process.env.MONGOOSE_URL)
  .then(() => {
    console.log("DB success connection");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", function (req, res) {
  res.render();
});

app.use("/api", newApi);
app.use("", userApi);
app.use("/upload", parser.single("avatar"), userApi);
app.use("/api", roomApi);
app.use("/api", messageAPi);
app.use("/api", parser.single("avatar"), messageAPi );

let chatRoom = '';
const users = [];

let chatRoomUsers = []
let allUsers = []
io.on("connection", function (socket) {
  socket.on("connected",  (user) => {
    let chatRoom = user.room;
    allUsers.push({ id: socket.id, username: user.name, room: user.room });
    chatRoomUsers =allUsers.filter((user) => user.room === chatRoom && user.username && user.room);
    socket.join(user.room); 
    })
      
  

  // Add this
  // Add a user to a room
  socket.on('send_message', (data) => {
    console.log('data', data);
    socket.broadcast.to(data.roomId).emit('receive_message', data);
  });

  socket.on('leave_room', (data) => {
    const { room } = data;
    socket.leave(room);
    // Remove user from memory
    allUsers = chatRoomUsers.filter((user) => user.id !== socket.id && user.username );
    console.log('allUsers left', allUsers);
    // socket.to(room).emit('chatroom_users', allUsers);
    
  });
});


server.listen(process.env.PORT, () => {
  console.log(` Listenning to port ${process.env.PORT}`);
});


// server.listen(process.env.PORT, () => {
//   console.log(` Listenning to port ${process.env.PORT}`);
// });


