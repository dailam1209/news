// const ErrorHandlerUser = require("../untils/ErrorHandlerUser");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModule");
const catchAsyncErrors = require("./catchAsyncErrors");


exports.isAuthenticatedUser = catchAsyncErrors(async (req,res,next) =>{
  let token;
  if(req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    try {
      if(token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded?.id);
        req.user = user;
        next();
      }
    } catch (err) {
      res.status(401).json({
        success: false,
        message: err.message
    })

    }
  } else {
    throw new Error("There is no token attached to header");
  }
});


// Admin Roles
exports.authorizeRoles = (...roles) => {
  return (req,res,next) =>{
      if(!roles.includes(req.user.role)){
        res.status(500).json({
          success: false,
          message: `${req.user.role} can not access this resources`
        })
      };
      next();
  }
}