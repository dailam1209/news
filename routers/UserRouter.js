const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const { 
    register, 
    login, 
    logout,
    resetpassword, 
    userDetails,
    forgotpassword, 
    checkEmail,
    deleteCode,
    updatePassword, 
    updateProfile,
    refreshAccessToken,
    getAlluserSameName,
    getChats,
    getChatUser,
    addFriend,
    removeFriend
} = require("../controllers/UserController");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/user-detail/:id").get(isAuthenticatedUser, userDetails);
router.route("/forgot-password").post( forgotpassword);
router.route("/reset-password").post( resetpassword);
router.route("/update-password").post( updatePassword);
router.route("/check-email").post( checkEmail);
router.route("/delete-code").post( deleteCode);
router.route("/update/:id").put( isAuthenticatedUser, updateProfile);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/search").get( isAuthenticatedUser, getAlluserSameName);
router.route("/get-chats").get( isAuthenticatedUser, getChats);
router.route("/get-chat/:idRoom").get( isAuthenticatedUser, getChatUser);
router.route("/add-friend/:userAdd").post( isAuthenticatedUser, addFriend);
router.route("/remove-friend/:userRemove").post( isAuthenticatedUser, removeFriend);

module.exports = router;
