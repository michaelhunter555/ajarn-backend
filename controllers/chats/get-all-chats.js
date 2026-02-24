const Chats = require("../../models/chats");
const HttpError = require("../../models/http-error");

const getAllChats = async (req, res, next) => {
  const { userId } = req.params;
  const { page, limit, search } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 5;

  const isValidQuery = typeof search === 'string' && search.trim().length > 3;
  let query = {
    $or: [{ teacherId: userId }, { employerId: userId }],
    lastMessage: { $exists: true, $ne: null },
    lastMessageDate: { $exists: true, $ne: null },
    chatIsComplete: false,
    teacherLeftChat: false,
    employerLeftChat: false,
  }
  if(isValidQuery) {
    const regex = new RegExp(search, 'i');
    query.participantInfo = {
        $elemMatch: {
            id: {$ne: userId},
            name: regex,
        }
    }
  }

  let chats;

  try {
    chats = await Chats.find(query).skip((pageNum - 1) * limitNum)
    .limit(limitNum);

    const totalChats = await Chats.countDocuments(query);

    const totalPages = Math.ceil(totalChats / limitNum);

    res.status(200).json({
        chats,
        totalPages,
        totalChats,
        pageNum,
        ok: true,
    });
  } catch(err) {
    console.log(err);
    res.status(500).json({ message: err, ok: false });
  }
  
  }

module.exports = getAllChats;