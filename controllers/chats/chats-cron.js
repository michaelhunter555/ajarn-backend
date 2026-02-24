const Chats = require("../../models/chats");
const ChatMessages = require("../../models/messages");

const chatsCron = async () => {
  try {
    const chatFilter = {
      chatIsComplete: true,
      $or: [{ teacherLeftChat: true }, { employerLeftChat: true }],
    };

    const chats = await Chats.find(chatFilter).select("_id");

    if (!chats.length) {
      console.log("0 chats deleted");
      console.log("0 messages deleted");
      return;
    }

    const chatIds = chats.map((chat) => chat._id);
    const messagesDeleteResult = await ChatMessages.deleteMany({
      chatId: { $in: chatIds },
    });
    const chatsDeleteResult = await Chats.deleteMany({
      _id: { $in: chatIds },
    });

    console.log(`${chatsDeleteResult.deletedCount || 0} chats deleted`);
    console.log(`${messagesDeleteResult.deletedCount || 0} messages deleted`);
  } catch (err) {
    console.log("Failed to delete completed chats:", err);
  }
};

module.exports = chatsCron;