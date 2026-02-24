const Chats = require("../../models/chats");
const Message = require("../../models/messages");
const User = require("../../models/users");
const HttpError = require("../../models/http-error");
const { getIO, checkRoom, NotificationsList } = require("../../lib/socket");
const { handleNewMessageEmailNotification } = require("../../lib/brevoHelper");


const createChat = async (req, res, next) => {
    const { senderId } = req.params;
  const { teacherData, employerData, message } = req.body;

  if(req?.userData?.userId?.toString() !== senderId?.toString()){
    console.log("blocked")
    const error = new HttpError(
      "Forbidden - You are not authorized to create a chat with this user.",
      403
    );
    return next(error);
  }

  const totalChats = await Chats.countDocuments({
    $or: [{ teacherId: senderId }, { employerId: senderId }],
    chatIsComplete: false,
    teacherLeftChat: false,
    employerLeftChat: false,
  });

  if(totalChats >= 10) {
    const error = new HttpError(
      "You have reached the maximum number of chats. Please leave some chats to create a new one.",
      400
    );
    return next(error);
  }

  const newChat = new Chats({
    teacherId: teacherData._id,
    employerId: employerData._id,
    participantInfo: [
      {
        id: teacherData._id,
        name: teacherData.name,
        image: teacherData.image,
        userType: teacherData.userType,
      },
      {
        id: employerData._id,
        name: employerData.name,
        image: employerData.image,
        userType: employerData.userType,
      },
    ],
    lastMessage: message,
    lastMessageDate: new Date(),
  });

  const newMessage = new Message({
    message: message,
    senderId: senderId,
    chatId: newChat._id,
  });

  try {
    await newChat.save();
    await newMessage.save();

    if (teacherData?._id && checkRoom(teacherData._id)) {
        const io = getIO();
        io.to(String(teacherData._id)).emit(NotificationsList.newMessage, {
            message: message,
            senderId: senderId,
            chatId: newChat._id,
            userData: {
                name: employerData.name,
                image: employerData.image,
                userType: employerData.userType,
                id: employerData._id,
            },
        });
    } else {
        const user = await User.findById(teacherData._id).select("name email").lean();
        if(user) {
          await handleNewMessageEmailNotification(employerData.name, user.email, message);
        }
    }
    res.status(201).json({ chat: newChat, ok: true });
  } catch (err) {
    console.log("error", err);
    const error = new HttpError(
      "There was an issue creating the chat.",
      500
    );
    return next(error);
  }

};

module.exports = createChat;