const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");


const {createRoom, deleteRoom } = require("../controllers/RoomIdController");


router.route("/create-room").post(isAuthenticatedUser, createRoom);
router.route("/delete-room/:id").post(isAuthenticatedUser, deleteRoom);


module.exports = router;