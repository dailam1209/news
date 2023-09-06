const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");


const { createRoom, addMessage } = require("../controllers/MessageController");

router.route("/create-room").post(isAuthenticatedUser, createRoom);
router.route("/add-message").post(isAuthenticatedUser, addMessage);

module.exports = router;