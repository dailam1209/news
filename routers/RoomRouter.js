const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");


const {createRoom, deleteRoom, leftRoom, pushFcmRoom } = require("../controllers/RoomIdController");



router.route("/create-room").post(isAuthenticatedUser, createRoom);
router.route("/delete-room/:id").post(isAuthenticatedUser, deleteRoom);
router.route("/left-room/:id").post(isAuthenticatedUser, leftRoom);
router.route("/push-fcm/:idRoom").post(isAuthenticatedUser, pushFcmRoom);


module.exports = router;