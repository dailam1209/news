const express = require("express");
const router = express.Router();
const { isAuthenticatedUser } = require("../middleware/auth");


const {createMessage, getUrl, getAllMessageOfRoom, checkMessage } = require("../controllers/MessageController");

router.route("/create-message/:reciever").post(isAuthenticatedUser, createMessage);
router.route("/get-url").post(isAuthenticatedUser, getUrl);
router.route("/get-all-message/:idRoom").post(isAuthenticatedUser, getAllMessageOfRoom);
router.route("/check-message/:id").post(isAuthenticatedUser, checkMessage);

module.exports = router; 