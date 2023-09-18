const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");


const { getAllUserChat, get } = require("../controllers/MessageController");

router.route("/getuser-chat/:id").post(isAuthenticatedUser, getAllUserChat);

module.exports = router;