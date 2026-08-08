import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
export const initChatSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers?.cookie || "";
      const tokenFromCookie = cookieHeader
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("accessToken="))
        ?.split("=")[1];

      const token = socket.handshake.auth?.token || tokenFromCookie;

      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded._id).select(
        "-password -refreshToken"
      );
      if (!user) return next(new Error("User not found"));
      if (!user.society) return next(new Error("Society membership required"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const room = `society:${socket.user.society}`;
    socket.join(room);

    socket.broadcast.to(room).emit("user:online", {
      _id: socket.user._id,
      fullName: socket.user.fullName,
    });

    socket.on("message:send", async ({ content }) => {
      if (!content?.trim()) return;

      try {
        const message = await Message.create({
          room,
          society: socket.user.society,
          sender: socket.user._id,
          content: content.trim(),
        });

        const payload = {
          _id: message._id,
          room,
          content: message.content,
          createdAt: message.createdAt,
          sender: {
            _id: socket.user._id,
            fullName: socket.user.fullName,
            role: socket.user.role,
            avatar: socket.user.avatar,
          },
        };

        io.to(room).emit("message:new", payload);
      } catch (err) {
        socket.emit("message:error", { message: "Could not send message" });
      }
    });

    socket.on("typing", () => {
      socket.broadcast.to(room).emit("typing", {
        fullName: socket.user.fullName,
      });
    });

    socket.on("disconnect", () => {
      socket.broadcast.to(room).emit("user:offline", {
        _id: socket.user._id,
        fullName: socket.user.fullName,
      });
    });
  });
};
