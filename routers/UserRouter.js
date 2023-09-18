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
    getChats,
    getChatUser,
    addFriend,
    removeFriend,
    acceptRequestFriend,
    getAlluserSameName,
    getAllUserWantAdd,
    getAllSentOfMe
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
router.route("/get-all-request-add").get( isAuthenticatedUser, getAllUserWantAdd);
router.route("/get-all-sent-add").get( isAuthenticatedUser, getAllSentOfMe);
router.route("/remove-friend/:userRemove").post( isAuthenticatedUser, removeFriend);
router.route("/accept-friend/:idUserRequest").post( isAuthenticatedUser, acceptRequestFriend);


module.exports = router;
