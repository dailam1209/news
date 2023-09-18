const RoomId = require("../models/RoomIdModule");
const User = require("../models/UserModule");


exports.createRoom = async (req, res) => {
    const { room_id } = req.body; 
    const getRoom = await RoomId.findOne({room_id});
    try { 
        if(!getRoom) { 
            const newRoom = await RoomId.create({
                room_id
            })
            await User.findByIdAndUpdate(req.user.id, {
                $push: { roomId: newRoom._id }})
            res.status(200).json({
                success: true,
                message: `Create room_id: ${room_id} successfully.`
            })
        }
    } catch (err) {
        res.status(500).json(
            {
                success: false,
                message: err.message
            }
        )
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        await RoomId.findByIdAndDelete({ _id: id });
        res.status(200).json({
            success: true,
            message: 'Delete successfully.'
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};