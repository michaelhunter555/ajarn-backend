const Message = require("../../models/messages");
const Chat = require("../../models/chats");
const HttpError = require("../../models/http-error");

const getAllChatMessages = async (req, res, next) => {
    const { chatId, page, limit } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    try {

        const messages = await Message.find({ chatId }).select('participantInfo');
        if(!messages) {
            const error = new HttpError("No messages found for this chat.", 404);
            return next(error);
        }

        if(!messages.participantInfo.map(String).includes(req?.userData?.userId?.toString())) {
            const error = new HttpError("You are not authorized to access this chat.", 403);
            return next(error);
        }

        const totalMessages = await Message.countDocuments({ chatId });
        const totalPages = Math.ceil(totalMessages / limitNum);

        res.status(200).json({
            messages,
            totalPages,
            pageNum,
            ok: true,
        });
    } catch(err) {
        console.log(err);
        res.status(500).json({ error: err, ok: false });

    }
}

module.exports = getAllChatMessages;