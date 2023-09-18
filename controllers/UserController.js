const User = require("../models/UserModule");
const sendToken = require("../untils/jwtToken");
const { default: ErrHandle } = require("../untils/ErrHandle");
const sendEmail = require("../untils/sendEmail");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const gennerCode = require("../untils/genercode");
const jwt = require("jsonwebtoken");
const Message = require ('../models/MessageModule');

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
        message: "Request Fail"
      });
    }

    bcrypt.compare(password, user.password, function (err, result) {
      if (err) {
        res.status(401).json({
          success: false,
          message: e.message
        });
      }
      sendToken(user, 200, res);
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
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
exports.forgotpassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
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

    user.resetPasswordTime = Date.now();
    setTimeout(async function () {
      user.resetPasswordTime = "";
      await user.save({
        validateBeforeSave: false
      });
    }, 200000);
    user.code = gennerCode(6);

    await user.save({
      validateBeforeSave: false
    });

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
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(ErrHandle("Not found email matched", 400, res));
    }

    user.code = "";
    await user.save({
      validateBeforeSave: false
    });

    res.status(200).json({
      success: true,
      message: "Delete Code"
    });
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
    console.log("token", token);
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    console.log(resetPasswordToken);
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

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    if (req.file && id) {
      const user = await User.find({ id: id });
      if (user) {
        const newuserData = {
          name: name,
          email: email,
          image: req.file.path,
          phone: phone
        };
        await User.findByIdAndUpdate({_id: id}, newuserData, {
          new: true,
          runValidators: true,
          userFindAndModify: false
        });
      }
      const userUpdate = await User.find({ _id: id });
      await res.json({
        success: true,
        message: `${user.name} have updated.`,
        user: userUpdate
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if(refreshToken == null ) {
    return res.status(403).json({ message: "RefreshToken is required" })
  } 
  
  try {
    let findUser = await User.find({ refreshToken: refreshToken});
    if(!findUser) {
      res.status(403).json({ message: "RefreshToken is not in database!"});
      return;
    }
    // const decoded = jwt.veryfy(refreshToken, process.env.JWT_SECRET_KEY_REFRESH_TOKEN)l;
    let newAccessToken =  jwt.sign({ id: findUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '14m'
    });

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken
    });
  } catch (error) {
    return res.status(500).json({ message: error})
  }
};

// get alluser include same username
exports.getAlluserSameName = async (req, res) => {
  const queryName = req.query.name;
 try {
  const userFind =await User.find();
  const listResult = [];
  await userFind.filter( user => {
    if(user.username.indexOf(queryName) !== -1 || user.email.indexOf(queryName) !== -1) {
      const usersFriend = user.friend;
      console.log('usersFriend', usersFriend);
      if(usersFriend.length > 0) {
        usersFriend.map((id) => {
          if(user._id == id) {
            listResult.push({ id: user._id, username: user.username, image: user.image ? user.image : '', email: user.email, isFriend: true});
          } else {
            listResult.push({ id: user._id, username: user.username, image: user.image ? user.image : '', email: user.email, isFriend: false});
          }
        })
      } else {
        listResult.push({id: user._id, username: user.username, image: user.image ? user.image : '', email: user.email, isFriend: false});
      }
    }
  })

  res.status(200).json({
    success: true,
    message: 'Get same username',
    users: listResult
  })
 } catch (error) {
  res.status(500).json({
    success: false,
    message: error.message
  })
 }
};

// get chats of user
exports.getChats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const listRoom = user.roomId;
    const lastResults = await Promise.all(
      listRoom.map(async (value) => {
        const findAllMessage = await Message.find({ roomId: value });
        const length = findAllMessage.length;
        const last = length > 0 ? findAllMessage[length - 1] : null;
        return last;
      })
    );

    res.status(200).json({
      success: true,
      lastResults,
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
    const listMessage = await Message.find({ roomId : idRoom});


    res.status(200).json({
      success: true,
      listMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// add frined
exports.addFriend = async (req, res) => {
  // id user want add
  const { userAdd } = req.params;
 try {
  if(userAdd) {
    // save user want add friend to show friend know 
      await User.findByIdAndUpdate( userAdd, {
        $push: { friendRequest: req.user.id ,
                  },
       })
       // save requset of me all user me added friend
       await User.findByIdAndUpdate( req.user.id, {
        $push: {  sentFriendRequest : userAdd  },
       })
      res.status(200).json({
        success: true,
        message: 'You send friendRequest success'
      }) 
  } else {
    res.status(401).json({
      success: false,
      message: 'Not find user match with id in database.'
    })
  }
 } catch (error) {
  res.status(500).json({
    success: false,
    message: error.message
  })
 }
};


// remove friend
exports.removeFriend = async (req, res) => {
  const { userRemove } = req.params;
 try {
  if(userRemove) {
    // save user want add friend to show friend know 
    await User.findByIdAndUpdate( userRemove, {
      $pull: { sentFriendRequest: req.user.id ,
                },
     })
     // save requset of me all user me added friend
     await User.findByIdAndUpdate( req.user.id, {
      $pull: {  friendRequest: userRemove  },
     })
      res.status(200).json({
        success: true,
        message: 'You send remove friendRequest success'
      }) 
  } else {
    res.status(401).json({
      success: false,
      message: 'Not find user match with id in database.'
    })
  }
 } catch (error) {
  res.status(500).json({
    success: false,
    message: error.message
  })
 }
}

// accept friend
exports.acceptRequestFriend = async (req, res) => {
  const { idUserRequest } = req.params;
  console.log(idUserRequest);
  try {
    if(!idUserRequest) {
      res.status(400).json({
        success: false,
        message: `Not find id:${idUserRequest} match.`
      })
      return ;
    }
    await User.findByIdAndUpdate(req.user.id, {
      $push: { friend: idUserRequest}
    })
    await User.findByIdAndUpdate(idUserRequest, {
      $pull: { friendRequest: idUserRequest}
    })
    res.status(200).json({
      success: true,
      message: 'Accept successfull.'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

