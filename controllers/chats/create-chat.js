const Chats = require("../../models/chats");
const Message = require("../../models/messages");
const User = require("../../models/users");
const HttpError = require("../../models/http-error");

const createChat = async (req, res, next) => {
    const { senderId } = req.params;
  const { teacherData, employerData, message } = req.body;

  if(req?.userData?.userId?.toString() !== employerId?.toString()){
    const error = new HttpError(
      "Forbidden - You are not authorized to create a chat with this user.",
      403
    );
    return next(error);
  }

  const newChat = new Chats({
    teacherId: teacherData._id,
    employerId: employerData._id,
    participantInfo: [
      {
        id: teacherData._id,
        name: teacher.name,
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
    res.status(201).json({ chatId: newChat._id, ok: true });
  } catch (err) {
    const error = new HttpError(
      "There was an issue creating the chat.",
      500
    );
    return next(error);
  }

  res.status(201).json({ chat: newChat, ok: true });
};

module.exports = createChat;