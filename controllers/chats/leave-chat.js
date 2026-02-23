const Chat = require("../../models/chats");
const HttpError = require("../../models/http-error");

const leaveChat = async (req, res, next) => {
  const { chatId } = req.params;
  const { userType } = req.body;

  try {
    const chat = await Chat.findByIdAndUpdate(
        chatId,
        {
            [userType === "teacher" ? "teacherLeftChat" : "employerLeftChat"]: true,
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
    res.status(500).json({ error: err, ok: false });
  }
}

module.exports = leaveChat;