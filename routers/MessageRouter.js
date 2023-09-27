const express = require("express");
const router = express.Router();
const { isAuthenticatedUser } = require("../middleware/auth");


const {createMessage, getUrl, getAllMessageOfRoom } = require("../controllers/MessageController");

router.route("/create-message/:reciever").post(isAuthenticatedUser, createMessage);
router.route("/get-url").post(isAuthenticatedUser, getUrl);
router.route("/get-all-message/:idRoom").get(isAuthenticatedUser, getAllMessageOfRoom);

module.exports = router; 