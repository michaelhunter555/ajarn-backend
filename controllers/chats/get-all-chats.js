const Chats = require("../../models/chats");
const HttpError = require("../../models/http-error");

const getAllChats = async (req, res, next) => {
  const { userId } = req.params;
  const { page, limit } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;

  let chats;

  try {
    chats = await Chats.find({
        $or: [{ teacherId: userId }, { employerId: userId }],
        lastMessage: { $exists: true, $ne: null },
        lastMessageDate: { $exists: true, $ne: null },
    }).skip((pageNum - 1) * limitNum)
    .limit(limitNum);

    const totalChats = await Chats.countDocuments({
        $or: [{ teacherId: userId }, { employerId: userId }],
    });

    const totalPages = Math.ceil(totalChats / limitNum);

    res.status(200).json({
        chats,
        totalPages,
        pageNum,
        ok: true,
    });
  } catch(err) {
    console.log(err);
    res.status(500).json({ message: err, ok: false });
  }
  
  }

module.exports = getAllChats;