import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export default function Chat() {
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");

  // 🔥 Decode current user ID from token
  const currentUserId = token
    ? JSON.parse(atob(token.split(".")[1])).id
    : null;

  // CONNECT SOCKET
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
    });

    setSocket(newSocket);

    newSocket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    newSocket.on("typing", (userId) => {
      setTypingUser(userId);
    });

    newSocket.on("stopTyping", () => {
      setTypingUser(null);
    });

    return () => newSocket.disconnect();
  }, []);

  // FETCH USERS
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
        else setUsers([]);
      });
  }, []);

  // LOAD MESSAGES
  useEffect(() => {
    if (!selectedUser) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/messages/${selectedUser._id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
        else setMessages([]);
      });
  }, [selectedUser]);

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // SEND MESSAGE
  const sendMessage = () => {
    if (!message.trim() || !selectedUser) return;

    socket.emit("sendMessage", message, selectedUser._id);
    socket.emit("stopTyping", selectedUser._id);

    setMessage("");
  };

  // TYPING
  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (!selectedUser) return;

    socket.emit("typing", selectedUser._id);

    setTimeout(() => {
      socket.emit("stopTyping", selectedUser._id);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* USERS */}
      <div className="w-1/4 bg-white border-r p-4">
        <h2 className="text-xl font-bold mb-4">Users</h2>

        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`p-3 mb-2 rounded cursor-pointer flex justify-between items-center ${
              selectedUser?._id === user._id
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            <span>{user.name}</span>

            {/* 🟢 ONLINE */}
            {onlineUsers.includes(user._id) && (
              <span className="text-green-500 text-lg">●</span>
            )}
          </div>
        ))}
      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <div className="p-4 bg-white border-b font-bold flex justify-between">
          <span>
            {selectedUser ? selectedUser.name : "Select a user"}
          </span>

          {selectedUser && onlineUsers.includes(selectedUser._id) && (
            <span className="text-green-500 text-sm">Online</span>
          )}
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => {
            const isMe = msg.sender === currentUserId || msg.sender?._id === currentUserId;

            return (
              <div
                key={i}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-xs ${
                    isMe
                      ? "bg-green-500 text-white rounded-br-none"
                      : "bg-white border rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {/* 💬 TYPING */}
          {typingUser === selectedUser?._id && (
            <p className="text-sm text-gray-500 italic">
              {selectedUser?.name} is typing...
            </p>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        {selectedUser && (
          <div className="p-4 bg-white border-t flex gap-2">
            <input
              value={message}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}