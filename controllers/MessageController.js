const User = require("../models/UserModule");
const Message = require("../models/MessageModule");
const RoomId = require("../models/RoomIdModule");
const io = require('socket.io')

exports.createMessage = async (req, res) => {
    try {
        const { reciever } = req.params;
        const { roomId } = req.body;
        const { text, system, createdAt, image, sent, received, seen, deleteAt, hiddenTo, isReply} = req.body.messages[0];
        const { name, avatar, _id } = req.body.messages[0].user;

        const message = {
            sender: req.user.id,
            reciever: reciever,
            roomId: roomId,
            messages: [ 
                {
                    text: text,
                    createdAt: createdAt,
                    user: {
                        _id: _id,
                        name: name,
                        avatar:avatar
                    },
                    image: image,
                    system: system,
                    sent: sent,
                    received: received,
                    seen: seen,
                    deleteAt: deleteAt,
                    hiddenTo: hiddenTo,
                    isReply: isReply
                }
        ]
        };
        console.log('second',  message);
        const exitMessage = await Message.find({
            roomId: roomId
        });
        if(exitMessage.length == 0) {
            await Message.create(message);
            res.status(200).json({
                success: true,
                message: 'Send message successfully.',
                showMessage: message
            })
        } else {
            await exitMessage[0].messages.push(message.messages[0]);
            await exitMessage[0].save();
            res.status(200).json({
                success: true,
                message: 'Update message.',
            })
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

exports.updateMessage = async (req, res) => {
    
    try {
        const { idMessage } = req.params;
        const message = await Message.findById(idMessage);
        if(message) {
            await Message.findByIdAndUpdate(idMessage, req.body);
        }
        res.status(200).json({
            success: true,
            message: `Update message of ${idMessage} successfully.`
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getUrl = async (req, res) => {
    try {
        console.log('url', req.file);
        if(req.file) {
            res.status(200).json({
                success: true,
                image: req.file.path
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// get all message of room one
exports.getAllMessageOfRoom = async (req, res) => {
    try {
        const { idRoom } = req.params;
    const messages = await Message.find({
        roomId: idRoom
    });
   
    if(messages ) {
        res.status(200).json({
            success: true,
            listMessage: messages,
        })
    }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

