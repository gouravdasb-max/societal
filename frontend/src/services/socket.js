import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem("accessToken");
    
    let socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (!socketUrl || socketUrl.includes("localhost")) {
      socketUrl = "/"; // letting Vite proxy handle the WebSocket upgrade to the backend
    }

    socket = io(socketUrl, {
      autoConnect: false,
      withCredentials: true,
      auth: { token },
    });
  }
  return socket;
};
export const connectSocket = () => {
  const activeSocket = getSocket();
  activeSocket.auth = { token: localStorage.getItem("accessToken") };
  if (activeSocket.connected) activeSocket.disconnect();
  activeSocket.connect();
  return activeSocket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
