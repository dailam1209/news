const RoomId = require("../models/RoomIdModule");


exports.createRoom = async (req, res) => {
    const { room_id } = req.body; 
    try { 
        if(room_id) {
            await RoomId.create({
                room_id
            })
        }
        res.status(200).json({
            success: true,
            message: `Create room_id: ${room_id} successfully.`
        })
    } catch (err) {
        res.status(500).json(
            {
                success: false,
                message: err.message
            }
        )
    }
}