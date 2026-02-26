const jwt = require("jsonwebtoken");

let ioInstance;

const NotificationsList = {
    newMessage: 'newMessage',
    newJobApplications: 'newJobApplications',
    newRecruitmentOffer: 'newRecruitmentOffer',
    newRecruitmentResponse: 'newRecruitmentResponse',
    newCreditPurchase: 'newCreditPurchase',
}


const setupSocket = (io) => {
  ioInstance = io;

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake?.auth?.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.SECRET_WEB_TOKEN);
      if (!decoded?.userId) {
        return next(new Error("Authentication error"));
      }

      socket.data.userId = decoded.userId.toString();
      return next();
    } catch (err) {
      console.error("Socket authentication error:", err);
      return next(new Error("Authentication error"));
    }
  });

  // Register each connected user to their own private room.
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    socket.join(userId);

    console.log(`[Socket] Connected: ${socket.id} (user: ${userId})`);

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected: ${socket.id} - ${reason}`);
    });
  });
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.IO has not been initialized. Call setupSocket(io) first.");
  }

  return ioInstance;
};

const checkRoom = (userId) => {
  const io = getIO();
  return io.sockets.adapter.rooms.has(userId.toString());
};

module.exports = {
  setupSocket,
  getIO,
  NotificationsList,
  checkRoom,
};