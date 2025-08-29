const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const User = require("../models/user");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

let onlineUsers = new Map();

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id);

    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " joined Room : " + roomId);
      socket.join(roomId);

      socket.userId = userId;
      onlineUsers.set(userId, socket.id);

      io.to(roomId).emit("userOnline", { userId });
    });

    // SEND MESSAGE
    socket.on("sendMessage", async ({ firstName, lastName, userId, targetUserId, text }) => {
      try {
        const roomId = getSecretRoomId(userId, targetUserId);

        const user = await User.findById(userId);
        const photoUrl = user?.photoUrl || "https://via.placeholder.com/150";

        let chat = await Chat.findOne({ participants: { $all: [userId, targetUserId] } });
        if (!chat) {
          chat = new Chat({ participants: [userId, targetUserId], messages: [] });
        }

        const newMsg = { senderId: userId, text };
        chat.messages.push(newMsg);
        await chat.save();

        const savedMsg = chat.messages[chat.messages.length - 1]; // get createdAt

        io.to(roomId).emit("messageReceived", {
          firstName,
          lastName,
          text,
          userId,
          photoUrl,
          createdAt: savedMsg.createdAt,
        });
      } catch (err) {
        console.error("Error in sendMessage:", err);
      }
    });

    // Typing
    socket.on("typing", ({ userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      socket.to(roomId).emit("userTyping", { userId });
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        console.log(`❌ User ${socket.userId} disconnected`);
        io.emit("userOffline", { userId: socket.userId });
      }
    });
  });
};

module.exports = { initializeSocket };
