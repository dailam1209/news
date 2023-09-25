const User = require("../models/UserModule");
const Message = require("../models/MessageModule");
const RoomId = require("../models/RoomIdModule");
const io = require('socket.io')

exports.createMessage = async (req, res) => {
    try {
        const { sender } = req.user.id;
        const { reciever } =req.params;
        const { roomId } = req.body;
        const { text, createdAt, image, sent, received, seen, deleteAt, hiddenTo, isReply} = req.body.messages[0];
        const { name, avatar } = req.body.messages[0].user;

        const message = {
            sender: req.user.id,
            reciever: reciever,
            roomId: roomId,
            messages: [ 
                {
                    text: text,
                    createdAt: createdAt,
                    user: {
                        id: sender,
                        name: name,
                        avatar:avatar
                    },
                    image: image,
                    sent: sent,
                    received: received,
                    seen: seen,
                    deleteAt: deleteAt,
                    hiddenTo: hiddenTo,
                    isReply: isReply
                }
        ]
        };
        const exitMessage = await Message.findOne({
            sender: req.user.id,
            reciever: reciever,
            roomId: roomId
        });
        console.log(sender && reciever && roomId && text || sender && reciever && roomId && image);
        if(!exitMessage) {
            await Message.create(message);
            res.status(200).json({
                success: true,
                message: 'Send message successfully.',
                showMessage: message
            })
        } else {
            exitMessage.messages.push(message.messages[0]);
            await exitMessage.save();
            res.status(200).json({
                success: true,
                message: 'Update message.',
            })
        }
        
        
        
    } catch (error) {
        // socket.emit('messageError', { message: 'Have message error when send.'});
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
        const { sender, reciever, roomId } = req.body;
    const messages1 = await Message.find({
        sender: sender,
        reciever: reciever,
        roomId: roomId
    });
    const messages2 = await Message.find({
        sender: reciever,
        reciever:sender ,
        roomId: roomId
    });
    if(messages1 || messages2 ) {
        res.status(200).json({
            success: true,
            listMessage: messages1 ? messages1 : messages2
        })
    }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

