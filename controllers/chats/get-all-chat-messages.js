const Message = require("../../models/messages");
const Chat = require("../../models/chats");
const HttpError = require("../../models/http-error");

const getAllChatMessages = async (req, res, next) => {
    const { chatId, page, limit } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    try {
        const chat = await Chat.findOne({
            _id: chatId,
            "participantInfo.id": req.userData.userId
          }).select("_id");
          
          if (!chat) {
            return res.status(200).json({
                messages: [],
                totalPages: 0,
                totalMessages: 0,
                pageNum,
                ok: true,
            });
          }

        const messages = await Message.find({ chatId: chat._id })
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

        const totalMessages = await Message.countDocuments({ chatId: chat._id });
        const totalPages = Math.ceil(totalMessages / limitNum);

        res.status(200).json({
            messages,
            totalPages,
            totalMessages,
            pageNum,
            ok: true,
        });
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: err, ok: false });

    }
}

module.exports = getAllChatMessages;