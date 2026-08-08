import http from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import connectDB from "./db/index.js";
import { initChatSocket } from "./sockets/chat.socket.js";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
      },
    });

    app.set('io', io);

    initChatSocket(io);

    server.listen(PORT, () => {
      console.log(`🚀 Societal server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });
