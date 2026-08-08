import { useEffect, useRef, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { connectSocket, getSocket } from "../services/socket.js";
import api from "../services/api.js";

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState({});
  const bottomRef = useRef(null);
  const typingTimeouts = useRef({});

  useEffect(() => {
    api.get("/chat/messages").then((res) => {
      setMessages(res.data.data);
      setLoading(false);
    });

    const socket = connectSocket();

    socket.on("message:new", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", ({ fullName }) => {
      setTypingUsers((prev) => ({ ...prev, [fullName]: true }));
      clearTimeout(typingTimeouts.current[fullName]);
      typingTimeouts.current[fullName] = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[fullName];
          return next;
        });
      }, 1800);
    });

    return () => {
      socket.off("message:new");
      socket.off("typing");
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    getSocket().emit("message:send", { content: text });
    setText("");
  };

  const handleTyping = (val) => {
    setText(val);
    getSocket().emit("typing");
  };

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  const formatDay = (date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  };

  const getTypingText = () => {
    const names = Object.keys(typingUsers).filter(n => n !== user?.fullName);
    if (names.length === 0) return null;
    if (names.length === 1) return `${names[0]} is typing...`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
    return `Several people are typing...`;
  };

  const typingTextDisplay = getTypingText();

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>Community chat</h1>
          <p>Chat in real time with everyone in your society.</p>
        </div>
      </div>

      <div className="chat-wrap">
        <div className="chat-header">
          <div className="chat-heading">
            <div className="chat-heading-mark">#</div>
            <div>
              <h3>Neighbourhood</h3>
              <p>{user?.society?.name || "Your society"} · live community room</p>
            </div>
          </div>
          <div className="chat-head-actions"><div className="chat-live"><span /> Live</div><button className="chat-jump" onClick={scrollToBottom}>Bottom ↓</button></div>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="empty-state">
                <h3>No messages yet</h3>
                <p>Say hello to your neighbours 👋</p>
              </div>
            )}
            {messages.map((m, index) => {
              const messageDate = new Date(m.createdAt);
              const previousDate = index > 0 ? new Date(messages[index - 1].createdAt) : null;
              const isNewDay = !previousDate || messageDate.toDateString() !== previousDate.toDateString();
              const mine = m.sender?._id === user?._id;
              const sentAt = messageDate.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              });
              return (
                <div key={m._id}>
                {isNewDay && <button type="button" className="chat-day-divider" onClick={scrollToBottom}><span>{formatDay(messageDate)}</span></button>}
                <div className={`chat-msg ${mine ? "mine" : ""}`}>
                  <div className="avatar">
                    {m.sender?.avatar ? (
                      <img src={m.sender.avatar} alt="avatar" />
                    ) : (
                      m.sender?.fullName?.[0]?.toUpperCase() || "?"
                    )}
                  </div>
                  <div>
                    <div className="chat-meta">
                      {mine ? "You" : m.sender?.fullName}
                      {m.sender?.role === "admin" && " · admin"}
                      <span className="chat-time">{sentAt}</span>
                    </div>
                    <div className="chat-bubble">{m.content}</div>
                  </div>
                </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
        <div className="typing-indicator" style={{ display: typingTextDisplay ? "flex" : "none", alignItems: "center" }}>
          {typingTextDisplay && (
            <>
              <span className="typing-dots"><span></span><span></span><span></span></span>
              <span>{typingTextDisplay}</span>
            </>
          )}
        </div>
        <form className="chat-input-row" onSubmit={send}>
          <input
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Write a message to your neighbours..."
          />
          <button className="btn btn-primary chat-send" disabled={!text.trim()} aria-label="Send message">Send <span>↗</span></button>
        </form>
      </div>
    </AppLayout>
  );
}
