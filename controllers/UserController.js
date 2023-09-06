const User = require("../models/UserModule");
const sendToken = require("../untils/jwtToken");
const { default: ErrHandle } = require("../untils/ErrHandle");
const sendEmail = require("../untils/sendEmail");
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const gennerCode =  require("../untils/genercode")

// register
exports.register = async (req, res) => {
    try {
        const  { username, email, password } = req.body;

        const user = await User.findOne({ email });
        if(user) {
            res.status(400).json({
                success: false,
                message: "User already exists"
            })
        } else {
            const newUser = await User.create({
                username,
                email,
                password: bcrypt.hashSync(password, 10),
            });
            sendToken( newUser, 200, res);
        }

    }

    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
};


// login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if(!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Please enter the email and password'
            });
        }
        if(!user) {
            res.status(400).json({
                success: false,
                message: 'Request Fail'
            });
        }

        bcrypt.compare(password, user.password , function(err, result) {
            if(err)  {
                res.status(401).json({
                    success: false,
                    message: e.message
                })
            }
            sendToken( user, 200, res);
        });

    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            
        })
    }
}

//logout  -> ok
exports.logout = async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "LogOut Success!"
    })
}


// forgot password -> ok
exports.forgotpassword = async (req, res, next) => {

    const { email } = req.body;

    const user = await User.findOne({ email });
    if(!user) {
        res.status(400).json({
            message: 'Not found email match.'
        })
    }
//    const resetToken = user.getResetToken();
   const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = crypto.createHash("sha256")
                                    .update(resetToken)
                                    .digest("hex");

    user.resetPasswordTime = Date.now() + 15 * 60 * 1000;
    user.code = gennerCode(6);

   await user.save({
    validateBeforeSave: false
   });

   const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`

   const message = `Your password reset token is: \n\n ${resetPasswordUrl}`


   // send options
   try {
    await sendEmail( {
        email: user.email,
        subject: `Password`,
        code: user.code,
        refreshToken: resetToken,
        message
    });
    res.status(200).json({
        success: true,
        // refreshToken: resetToken,
        message: `Email sent to ${user.email} succesfully`
    });

   }
   catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTime = undefined;
    await user.save({
     validateBeforeSave: false
    });
    res.status(500).json({
        success: false,
        message: err.message
    })
   }
};


exports.checkEmail = async(req, res, next) => {
    try {
        const { email  } = req.body;
        const user = await User.findOne({ email });
        if(!user) {
            return next(
                ErrHandle("Not found email matched",400, res)
                )
        }
        else {

            user.code = "";
            await user.save({
                validateBeforeSave: false
                });
    
            res.status(200).json({
                success: true,
                message: "Have match code"
            })
        }


    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }

}

exports.deleteCode = async(req, res, next) => {
    try {
        const { email  } = req.body;
        const user = await User.findOne({ email });
        if(!user) {
            return next(
                ErrHandle("Not found email matched",400, res)
                )
        }
       
        user.code = "";
        await user.save({
            validateBeforeSave: false
            });

        res.status(200).json({
            success: true,
            message: "Delete Code"
        })


    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }

}

//  Get user Details
exports.userDetails = async (req, res, next) => {
    const user = await User.findById(req.user.id);
  
    res.status(200).json({
      success: true,
      user,
    });
};

// Reset Password -> ok
exports.resetpassword = async (req, res) => {

    try {
        const { token } = req.query;
        console.log('token', token);
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");
    
    
        console.log(resetPasswordToken);
        const user = User.findOne({
            resetPasswordToken: resetPasswordToken,
            resetPasswordTime: { $gt: Date.now()}
        });
        if( req.body.password !== req.body.confirPassword) {
            res.status(400).json({
                success: false,
                message: 'Password is not matched with the new password'
            })
        }
    
        if(!user) {
            res.status(400).json({
                success: false,
                message: 'Reset password false'
            })
        } 
        else {
    
            // user.password = bcrypt.hashSync(req.body.password, 10);
            // user.resetPasswordToken = undefined;
            // user.resetPasswordTime = undefined;
        
            // await user.save({ validateBeforeSave: false });
            await User.updateOne({ resetPasswordToken: resetPasswordToken },
                { $set: { password: bcrypt.hashSync(req.body.password, 10), resetPasswordToken: ""}}
            );
            
        
            res.status(200).json({
                success: true
            })
            // sendToken(user, 200, res);
        }
    } catch(err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }


}

// Update user Password ->ok

exports.updatePassword = async (req, res, next) => {
    try {

        const user = await User.findOne({ _id: req.body.user_id });
        const isPasswordMatched = await bcrypt.compare(req.body.oldPassword, user.password);
    
        if(!isPasswordMatched) {
            return next(
                ErrHandle("Old Password is incorrect", 400, res)
            )
        } 
        if(req.body.oldPassword === req.body.newPassword) {
            return next(
                ErrHandle("Password have been exist", 400, res)
            )
        }
    
        await User.updateOne(
                { email: user.email},
                { $set: { password: bcrypt.hashSync(req.body.newPassword, 10)}}
        );
    
        res.status(200).json(
            {
                success: true
            }
        )
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }

};



exports.updateProfile = async (req, res) => {
    try{
        const { id } = req.params;
        const { name, email } = req.body; 
        
        if(req.file && id) {
            const user = await User.find({id: id});
            if(user) {
                const  newuserData =  {
                    name: name,
                    email: email,
                    image: req.file.path
                }
                await User.findByIdAndUpdate(req.user._id, newuserData, {
                    new: true,
                    runValidators: true,
                    userFindAndModify: false,
                });
            }
            await res.json({ 
                success: true,
                message: `${user.name} have updated.`
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
    
}