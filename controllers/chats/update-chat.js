const Chats = require("../../models/chats");
const Message = require("../../models/messages");
const User = require("../../models/users");
const HttpError = require("../../models/http-error");
const { getIO, checkRoom, NotificationsList } = require("../../lib/socket");
const { handleNewMessageEmailNotification } = require("../../lib/brevoHelper");

const updateChat = async (req, res, next) => {
  const { senderId } = req.params;
  const { chatId, text } = req.body;

  if(!senderId || !chatId || !text) {
    const error = new HttpError(
        "Please provide a senderId, chatId, and text.",
        400
    );
    return next(error);
  }

  let chat;

  try {
    chat = await Chats.findByIdAndUpdate(
        chatId,
        {
            lastMessage: text,
            lastMessageDate: new Date(),
        },
        {
            new: true,
        }
    );
    if(!chat) {
        const error = new HttpError(
            "Could not find a chat with the given id.",
            404
        );
        return next(error);
    }

    const message = new Message({
        message: text,
        senderId,
        chatId,
    })
    await message.save();

    const sender = chat.participantInfo.find((p) => p.id.toString() === senderId.toString())
    if(checkRoom(senderId)) {
        const io = getIO();
        io.to(String(senderId)).emit(NotificationsList.newMessage, {
            message: text,
            senderId,
            chatId: chat._id,
            userData: {
                name: sender.name,
                image: sender.image,
                userType: sender.userType,
                id: sender.id,
            },
        });
    } else {
        const user = await User.findById(senderId).select("name email").lean();
        if(user) {
            await handleNewMessageEmailNotification(user.name, user.email, text);
        }
    }

    res.status(200)
    .json({
        message: message,
        ok: true,
    })

  } catch(err) {
    const error = new HttpError(
        "There was an issue updating the chat.",
        500
    );
    return next(error);
  }
};

module.exports = updateChat;