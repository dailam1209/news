const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");


const {createRoom } = require("../controllers/RoomIdController");


router.route("/create-room").post(createRoom);


module.exports = router;