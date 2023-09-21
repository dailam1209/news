const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");


const {createMessage } = require("../controllers/MessageController");

router.route("/create-message/:reciever").post(isAuthenticatedUser, createMessage);

module.exports = router; 