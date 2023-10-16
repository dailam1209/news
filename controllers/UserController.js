const User = require("../models/UserModule");
const sendToken = require("../untils/jwtToken");
const { default: ErrHandle } = require("../untils/ErrHandle");
const sendEmail = require("../untils/sendEmail");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const gennerCode = require("../untils/genercode");
const makeid = require("../untils/genercode");
const jwt = require("jsonwebtoken");
const Message = require("../models/MessageModule");
const RoomIdModule = require("../models/RoomIdModule");

// register
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      res.status(400).json({
        success: false,
        message: "User already exists"
      });
    } else {
      const newUser = await User.create({
        username,
        email,
        password: bcrypt.hashSync(password, 10)
      });
      sendToken(newUser, 200, res);
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Please enter the email and password"
      });
    }
    if (!user) {
      res.status(400).json({
        success: false,
        message: "Please check email or password again."
      });
    } else {
      bcrypt.compare(password, user.password, function (err, result) {
        if (err) {
          res.status(401).json({
            success: false,
            message: e.message
          });
        }
        sendToken(user, 200, res);
      });
    }

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.postFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (fcmToken) {
      const user = await User.findById(req.user.id);
      user.fcmToken = fcmToken;
      await user.save();
    }
    res.status(200).json({
      success: true,
      message: "Put fcmToken success."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.isOnline = async (req, res) => {
  const { state } = req.body;
  try {
    const userId = req.user.id;
    await User.findByIdAndUpdate(
      userId,
      { isOnline: state },
      {
        new: true,
        runValidators: true,
        userFindAndModify: false
      }
    );
    res.status(200).json({
      success: true,
      message: "Update state online success."
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: error.message
    });
  }
};

//logout  -> ok
exports.logout = async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: "LogOut Success!"
  });
};

// forgot password -> ok
exports.forgotpassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email });
  if (!user) {
    res.status(400).json({
      message: "Not found email match."
    });
  } else {
    //    const resetToken = user.getResetToken();
    const resetToken = crypto.randomBytes(20).toString("hex");
    // user.resetPasswordToken = crypto.createHash("sha256")
    //                                 .update(resetToken)
    //                                 .digest("hex");

    user.code = makeid(6);
    console.log(typeof user.code);

    user.resetPasswordTime = Date.now();

    await user.save();
    console.log('user', user);

    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/password/reset/${resetToken}`;

    const message = `Your password reset token is: \n\n ${resetPasswordUrl}`;

    // send options
    try {
      if (user.code) {
        await sendEmail({
          email: user.email,
          subject: `Password`,
          code: user.code,
          message
        });
        res.status(200).json({
          success: true,
          message: `Email sent to ${user.email} succesfully`
        });
      } else {
        res.status(400).json({
          message: "Not code to send."
        });
      }
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordTime = undefined;
      await user.save({
        validateBeforeSave: false
      });
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
};

// exports.forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   const user = await User.findOne({ email });
//   try {

//     if (!user) {
//       return res.status(400).json({ message: "Email not found." });
//     }

//     const resetToken = crypto.randomBytes(20).toString("hex");
//     const code = makeid(6);
//     user.code = code;
//     user.resetPasswordTime = Date.now();

//     await user.save();

//     const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;
//     const message = `Your password reset token is: \n\n ${resetPasswordUrl}`;

//     if (user.code) {
//       await sendEmail({
//         email: user.email,
//         subject: "Password Reset",
//         message,
//       });

//       return res.status(200).json({
//         success: true,
//         message: `Email sent to ${user.email} successfully.`,
//       });
//     } else {
//       return res.status(400).json({ message: "No code to send." });
//     }
//   } catch (err) {
//     user.resetPasswordToken = undefined;
//     user.resetPasswordTime = undefined;
//     await user.save({ validateBeforeSave: false });
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

exports.checkEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(ErrHandle("Not found email matched", 400, res));
    } else {
      user.code = "";
      await user.save({
        validateBeforeSave: false
      });

      res.status(200).json({
        success: true,
        message: "Have match code"
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.deleteCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(ErrHandle("Not found email matched", 400, res));
    } else {
      if(user.code == code) {

        user.code = "";
        await user.save({
          validateBeforeSave: false
        });
    
        res.status(200).json({
          success: true,
          message: "Delete Code"
        });
      }
      }

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

//  Get user Details
exports.userDetails = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user
  });
};

// Reset Password -> ok
exports.resetpassword = async (req, res) => {
  try {
    const { token } = req.query;
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = User.findOne({
      resetPasswordToken: resetPasswordToken,
      resetPasswordTime: { $gt: Date.now() }
    });
    if (req.body.password !== req.body.confirPassword) {
      res.status(400).json({
        success: false,
        message: "Password is not matched with the new password"
      });
    }

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Reset password false"
      });
    } else {
      // user.password = bcrypt.hashSync(req.body.password, 10);
      // user.resetPasswordToken = undefined;
      // user.resetPasswordTime = undefined;

      // await user.save({ validateBeforeSave: false });
      await User.updateOne(
        { resetPasswordToken: resetPasswordToken },
        {
          $set: {
            password: bcrypt.hashSync(req.body.password, 10),
            resetPasswordToken: ""
          }
        }
      );

      res.status(200).json({
        success: true
      });
      // sendToken(user, 200, res);
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Update user Password ->ok

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.body.user_id });
    const isPasswordMatched = await bcrypt.compare(
      req.body.oldPassword,
      user.password
    );

    if (!isPasswordMatched) {
      return next(ErrHandle("Old Password is incorrect", 400, res));
    }
    if (req.body.oldPassword === req.body.newPassword) {
      return next(ErrHandle("Password have been exist", 400, res));
    }

    await User.updateOne(
      { email: user.email },
      { $set: { password: bcrypt.hashSync(req.body.newPassword, 10) } }
    );

    res.status(200).json({
      success: true
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// update profile user -> ok
exports.updateProfile = async (req, res) => {
  try {
    console.log('vao roi');
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const user = await User.findById(id);
    if(user) {

      console.log("req.file.path", req.imageUrl);
        user.image = req.imageUrl ?  req.imageUrl : user.image;
        user.name = name;
        user.email = email;
        user.phone = phone;
        await user.save()
        
        res.status(200).json({
          success: true,
          message: `${user.name} have updated.`,
          user: user
        });
    }
     else {
      res.status(400).json({
        success: false,
        message: `Update faild.`,
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// refresh token -> ok
exports.refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken == null) {
    return res.status(403).json({ message: "RefreshToken is required" });
  }

  try {
    let findUser = await User.findOne({ refreshToken: refreshToken });
    if (!findUser) {
      res.status(403).json({ message: "RefreshToken is not in database!" });
      return;
    }
    // const decoded = jwt.veryfy(refreshToken, process.env.JWT_SECRET_KEY_REFRESH_TOKEN)l;
    let newAccessToken = jwt.sign(
      { id: findUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "14m"
      }
    );

    return res.status(200).json({
      user: findUser,
      accessToken: newAccessToken
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

// get all user include same text search -> ok
exports.getAlluserSameName = async (req, res) => {
  const queryName = req.query.name;
  const currentUserId = req.user.id;
  try {
    // Fetch all users with username or email containing the queryName
    const users = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: queryName.trim(), $options: "i" } }, // Case-insensitive search
            // { email: { $regex: queryName.trim(), $options: "i" } } // Case-insensitive search
          ]
        },
        { _id: { $ne: currentUserId } } // Exclude the current user
      ]
    });

    // Get the IDs of the current user's friends
    const userCurrent = await User.findById(currentUserId).select("friend");
    const userCurrentFriend = await User.findById(currentUserId).select("sentFriendRequest");
   
    const friendsIds = userCurrent.friend;
    const sentFriendIs = userCurrentFriend.sentFriendRequest;

    // Create a map for faster friend lookup
    const friendsMap = new Map(friendsIds.map((id) => [id.toString(), true]));
    const sentFriendMap = new Map(sentFriendIs.map((id) => [id.user.toString(), true]));

    // Prepare the list of results
    const listResult = users.map((user) => ({
      id: user._id,
      username: user.username,
      image: user.image || "",
      email: user.email,
      isFriend: friendsMap.has(user._id.toString()) || sentFriendMap.has(user._id.toString()) // Check if the user is a friend
    }));

    res.status(200).json({
      success: true,
      message: "Get users with the same username or email",
      users: listResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllFriend = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // const resultUser = [];
    const listFriend = user.friend;

    const resultUser = await User.find({ _id: { $in: listFriend } });

    // Format lại dữ liệu nếu cần
    const formattedUsers = resultUser.map((findUser) => ({
      username: findUser.username,
      email: findUser.email,
      image: findUser.image ? findUser.image : "",
      id: findUser._id,
      isOnline: findUser.isOnline,
      fcmToken: findUser.fcmToken ? findUser.fcmToken : ""
    }));

    // await Promise.all(
    //   listFriend.map( async (user) => {
    //     let findUser = await User.findById(user);
    //     let inforUser = {
    //       username: findUser.username,
    //       email: findUser.email,
    //       image: findUser.image,
    //       id: findUser._id,
    //       isOnline: findUser.isOnline
    //     }
    //     resultUser.push(inforUser);
    //   })
    // );

    res.status(200).json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// get chats of user -> get last all message
// exports.getChats = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     const lastMessageAll = [];
//     const listRoom = user.roomId;
//     await Promise.all(
//       await listRoom.map(async (value) => {
//         const findAllMessage = await Message.find({ roomId: value });
//         findAllMessage.map(async (item) => {
//           const userFind = item.sender == req.user.id ? item.reciever : item.sender;
//           const getUser = await User.findById(userFind);
//           const messages = item.messages;
//           if (messages.length > 0) {
//             const lastMessage = messages[messages.length - 1];
//             const filterMessage =
//               {
//                 roomId: item.roomId,
//                 sender: item.render,
//                 reciever: item.reciever,
//                 text: lastMessage.text,
//                 isOnline: getUser?.isOnline,
//                 createAt: item.createAt
//               }
//             lastMessageAll.push(filterMessage);
//             console.log(filterMessage);
//           }
//         });
//       })
//     );

//     res.status(200).json({
//       success: true,
//       lastMessageAll
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };


//  last of all chats
exports.getChats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const lastMessageAll = [];
    const listRoom = user.roomId;

    // Tạo mảng các promise cho việc lấy thông tin các phòng chat
    const roomPromises = await listRoom.map(async (value) => {
      const findAllMessage = await Message.findOne({ roomId: value });
      const room = await RoomIdModule.findOne({
        room_id: value
    });
      let imageOfFriendChat = '';
      let nameOfFriendChat = '';
    console.log("req.user.id === room.senderId.toString()", req.user.id , room.senderId);
      if(!room.typeRoom) {
        console.log('one');
        const idUser = req.user.id == room.senderId.toString()
        ? room.receverId : room.senderId ;
        let user = await User.findById(idUser);
        nameOfFriendChat = user.username;
        imageOfFriendChat = user.image;
      } else {
        console.log('group');
        nameOfFriendChat = room.nameRoom;
        imageOfFriendChat = room.imageRoom;
      }
      let count = 0;
     
      // Lặp qua các tin nhắn và cập nhật trường 'seen' thành true
      await findAllMessage?.messages?.forEach((msg) => {
        if (!msg.seen && msg.user.name && msg?.user?._id?.toString() !== req.user.id) {
          count ++;
        }
      });
      if (findAllMessage) {
        const lastMessage =
          findAllMessage.messages[findAllMessage.messages.length - 1];
        if (lastMessage.text !== "" || lastMessage.image !== '') {
          // const userFind = findAllMessage.messages.sender == req.user.id ? findAllMessage.reciever : findAllMessage.sender;
          const userFind = lastMessage.reciever;
          const getUser = await User.findById(userFind);

          const filterMessage = {
            roomId: findAllMessage.roomId,
            sender: {
              id: findAllMessage.sender,
              username:
              lastMessage.user.name
            },
            reciever: userFind,
            text: findAllMessage.messages[
              findAllMessage.messages.length - 1
            ].text,
            image:lastMessage.image,
            isOnline: getUser?.isOnline,
            imageUser: imageOfFriendChat,
            username: nameOfFriendChat,
            fcmToken: getUser.fcmToken,
            idSender: findAllMessage.messages.user
              ? findAllMessage.messages.user
              : "",
            createAt: lastMessage.createdAt,
            typeRoom: room.typeRoom ,
            imageRoom: imageOfFriendChat,
            nameRoom: nameOfFriendChat,
            count: count
          };
          console.log("filterMessage", filterMessage);

          lastMessageAll.push(filterMessage);
        }
      }
    });

    // Đợi tất cả các promise hoàn thành trước khi trả kết quả
    await Promise.all(roomPromises);

    res.status(200).json({
      success: true,
      lastMessageAll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getChatUser = async (req, res) => {
  try {
    const { idRoom } = req.params;
    const listMessage = await Message.find({ roomId: idRoom });

    res.status(200).json({
      success: true,
      listMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// add frined -> ok
exports.addFriend = async (req, res) => {
  // id user want add
  const { userAdd } = req.params;
  try {
    if (userAdd) {
      const friendRequest = {
        user: userAdd,
        createdAt: new Date() // Set the createdAt field to the current date and time
      };
      const userRequest = {
        user: req.user.id,
        createdAt: new Date() // Set the createdAt field to the current date and time
      };
      // save user want add friend to show friend know
      await User.findByIdAndUpdate(userAdd, {
        $push: { friendRequest: userRequest }
      });
      // save requset of me all user me added friend
      await User.findByIdAndUpdate(req.user.id, {
        $push: { sentFriendRequest: friendRequest }
      });

      res.status(200).json({
        success: true,
        message: "You send friendRequest success"
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Not find user match with id in database."
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// none accept user add friend (only remove with me) -> ok
exports.removeFriend = async (req, res) => {
  const { userRemove } = req.params;
  try {
    if (userRemove) {
      // save user want add friend to show friend know
      // await User.findByIdAndUpdate(userRemove, {
      //   $pull: { sentFriendRequest: { user: req.user.id } }
      // });
      // save requset of me all user me added friend
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { friendRequest: { user: userRemove } }
      });
      res.status(200).json({
        success: true,
        message: "You send remove friendRequest success"
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Not find user match with id in database."
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// not want add friend with you(when you still not accept with me) or not accept you(when be have friend)
// -> ok
exports.removeFriendWhenMeSend = async (req, res) => {
  const { userRemove } = req.params;
  try {
    if (userRemove) {
      // save user want add friend to show friend know
      await User.findByIdAndUpdate(userRemove, {
        $pull: { friendRequest: { user: req.user.id } }
      });
      // save requset of me all user me added friend
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { sentFriendRequest: { user: userRemove } }
      });
      res.status(200).json({
        success: true,
        message: "You send remove friendRequest success"
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Not find user match with id in database."
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// get all user want add friend with me -> ok
exports.getAllUserWantAdd = async (req, res) => {
  const currentUserId = req.user.id;
  try {
    const user = await User.findById(currentUserId);
    const listUserWantAddMe = await user.friendRequest;
    const retult = [];
    if (listUserWantAddMe.length > 0) {
      await Promise.all(
        listUserWantAddMe.map(async (value) => {
          const userRequest = await User.findById(value.user);
          const informationUser = {
            _id: value.user,
            username: userRequest.username,
            email: userRequest.email,
            image: userRequest.image ?? "",
            createAt: value.createdAt
          };
          retult.push(informationUser);
        })
      );

      res.status(200).json({
        success: true,
        listUserRequest: retult
      });
    } else {
      res.status(200).json({
        success: true,
        listUserRequest: []
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// accept friend --> unstill test UI
exports.acceptRequestFriend = async (req, res) => {
  // id of user want add with you
  const { idUserRequest } = req.params;
  try {
    if (!idUserRequest) {
      res.status(400).json({
        success: false,
        message: `Not find id:${idUserRequest} match.`
      });
      return;
    }

    // push friend all of 2
    await User.findByIdAndUpdate(req.user.id, {
      $push: { friend: idUserRequest }
    });
    await User.findByIdAndUpdate(idUserRequest, {
      $push: { friend: req.user.id }
    });

    // user recevice
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { friendRequest: { user: idUserRequest } }
    });
    // user send
    await User.findByIdAndUpdate(idUserRequest, {
      $pull: { sentFriendRequest: { user: req.user.id } }
    });
    res.status(200).json({
      success: true,
      message: "Accept successfull."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// all user me sent to add friend -> ok
exports.getAllSentOfMe = async (req, res) => {
  const currentUserId = req.user.id;
  try {
    const user = await User.findById(currentUserId);
    const listUserWantAddMe = await user.sentFriendRequest;
    const retult = [];
    if (listUserWantAddMe.length > 0) {
      await Promise.all(
        listUserWantAddMe.map(async (value) => {
          const userRequest = await User.findById(value.user);
          const informationUser = {
            _id: value.user,
            username: userRequest.username,
            email: userRequest.email,
            image: userRequest.image,
            date: value.createdAt
          };
          retult.push(informationUser);
        })
      );

      res.status(200).json({
        success: true,
        listUserRequest: retult
      });
    } else {
      res.status(200).json({
        success: true,
        listUserRequest: []
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.onRoom = async (req, res) => {
  try {
    const { idRoom } = req.body;
    const user = await User.findById(req.user.id);
    user.onRoom = idRoom;
    await user.save();
    res.status(200).json({
      success: true,
      message: "OnRoom"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.imageUrl = async (req, res) => {
  try {
    console.log('url', req.file);
    if(req.file) {
      res.status(200).json({
        imageUrl: req.file.path
      })
    } 
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}
