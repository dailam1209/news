const RoomId = require("../models/RoomIdModule");
const User = require("../models/UserModule");


exports.createRoom = async (req, res) => {
    const { room_id, senderId , receverId } = req.body; 
    const getRoom1 = await RoomId.findOne({ senderId: senderId, receverId: receverId});
    const getRoom2 = await RoomId.findOne({ senderId: receverId, receverId: senderId });
    try { 
        if(!getRoom1 && !getRoom2 ) { 
            await RoomId.create({
                room_id,
                senderId: senderId, 
                receverId: receverId
            })
            await User.findByIdAndUpdate(senderId, {
                $push: { room_id: room_id }})

            await User.findByIdAndUpdate(receverId, {
                $push: { room_id: room_id }})
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