const Chat = require("../../models/chats");
const HttpError = require("../../models/http-error");

const leaveChat = async (req, res, next) => {
  const { userId } = req.params;
  const { userType, chatId } = req.body;

  try {
    const chat = await Chat.findByIdAndUpdate(
        chatId,
        {
            [userType === "teacher" ? "teacherLeftChat" : "employerLeftChat"]: true,
            chatIsComplete: true,
            lastMessage: "user left the chat",
            lastMessageDate: new Date(),
        },
        {
            new: true,
        }
    );
    if(!chat) {
        const error = new HttpError("Chat not found", 404);
        return next(error);
    }

    res.status(200).json({ ok: true });
  } catch(err) {
    console.log(err);
    res.status(500).json({ message: err, ok: false });
  }
}

module.exports = leaveChat;