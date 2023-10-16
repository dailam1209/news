const express = require("express");
const http = require("http");
const socketIo = require("socket.io")
const app = express();
const server = http.createServer(app);
const bodyParser = require("body-parser");
const cros = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");


const io = socketIo(server);

// upload image
const cloudinary = require("./config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
// Cấu hình CloudinaryStorage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: "uploads", 
  allowedFormats: ["jpg", "png", "jpeg"],
  transformation: [{ width: 100, height: 100, crop: "limit" }]
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


app.use("/api", newApi);
app.use("", userApi);
app.use("/upload", async (req, res, next) => {
   await parser.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: 'Error uploading file' });
    }
    const imageUrl = req?.file?.path;

    req.imageUrl = imageUrl;
    next();
  });
}, userApi );
app.use("/api", roomApi);
app.use("/api", messageAPi);
app.use("/api/image", async (req, res, next) => {
  await parser.single("image")(req, res, (err) => {
   if (err) {
     return res.status(400).json({ error: 'Error uploading file' });
   }
   const imageUrl = req?.file?.path;

   req.imageUrl = imageUrl;
   next();
 });
}, messageAPi );


let chatRoomUsers = []
let allUsers = []
io.on("connection", function (socket) {
  socket.on("connected",  (user) => {
    let chatRoom = user.room;
    allUsers.push({ id: socket.id, username: user.name, room: user.room });
    chatRoomUsers =allUsers.filter((user) => user.room == chatRoom);
    socket.join(user.room); 
    })
      
  

  // Add this
  // Add a user to a room
  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', data);
  });

  socket.on('leave_room', (data) => {
    const { room } = data;
    socket.leave(room);
    // Remove user from memory
    allUsers = chatRoomUsers.filter((user) => user.id !== socket.id);
    // socket.to(room).emit('chatroom_users', allUsers);
    
  });
});


server.listen(process.env.PORT, () => {
  console.log(` Listenning to port ${process.env.PORT}`);
});


