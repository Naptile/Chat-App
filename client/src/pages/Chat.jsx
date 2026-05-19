import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export default function Chat() {
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUsers, setShowUsers] = useState(true);

  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [unread, setUnread] = useState({});
  const [lastMessages, setLastMessages] = useState({});

  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  const token = localStorage.getItem("token");

  const currentUserId = token
    ? JSON.parse(atob(token.split(".")[1])).id
    : null;

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // 🔊 notification sound
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
  }, []);

  // SOCKET
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
    });

    setSocket(newSocket);

    newSocket.on("receiveMessage", (msg) => {
      const senderId = msg.sender?._id || msg.sender;

      setLastMessages((prev) => ({
        ...prev,
        [senderId]: msg.text || "📷 Image",
      }));

      // 🔊 play sound if not current chat
      if (!selectedUser || senderId !== selectedUser._id) {
        audioRef.current?.play();
      }

      if (selectedUser && senderId === selectedUser._id) {
        setMessages((prev) => [...prev, msg]);
        newSocket.emit("markSeen", senderId);
      } else {
        setUnread((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }
    });

    newSocket.on("messagesSeen", () => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender === currentUserId
            ? { ...msg, status: "seen" }
            : msg
        )
      );
    });

    newSocket.on("onlineUsers", setOnlineUsers);
    newSocket.on("typing", setTypingUser);
    newSocket.on("stopTyping", () => setTypingUser(null));

    return () => newSocket.disconnect();
  }, [selectedUser]);

  // USERS
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setUsers(data));
  }, []);

  // LOAD CHAT
  useEffect(() => {
    if (!selectedUser) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/messages/${selectedUser._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setMessages);

    socket?.emit("markSeen", selectedUser._id);

    setUnread((prev) => ({
      ...prev,
      [selectedUser._id]: 0,
    }));
  }, [selectedUser]);

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // SEND MESSAGE
  const sendMessage = () => {
    if ((!message.trim() && !image) || !selectedUser) return;

    socket.emit("sendMessage", {
      text: message,
      image,
      to: selectedUser._id,
    });

    setMessage("");
    setImage(null);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (!selectedUser) return;

    socket.emit("typing", selectedUser._id);

    setTimeout(() => {
      socket.emit("stopTyping", selectedUser._id);
    }, 1000);
  };



  const handleImageUpload = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  setImage(data.imageUrl);
};


  return (
    <div className="flex h-screen bg-[#111b21] text-white">

      {/* USERS */}
      <div className={`${showUsers ? "block" : "hidden"} md:block w-full md:w-1/4 bg-[#202c33]`}>
        <h2 className="p-4 font-bold text-lg">Chats</h2>

        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => {
              setSelectedUser(user);
              setShowUsers(false);
            }}
            className="flex items-center gap-3 p-3 hover:bg-[#2a3942] cursor-pointer"
          >
            {/* Avatar */}
            <img
              src={user.avatar || "https://i.pravatar.cc/40"}
              className="w-10 h-10 rounded-full"
            />

            <div className="flex-1">
              <div className="flex justify-between">
                <span>{user.name}</span>
                {onlineUsers.includes(user._id) && (
                  <span className="text-green-400 text-xs">●</span>
                )}
              </div>

              <div className="text-sm text-gray-400 truncate">
                {lastMessages[user._id] || "No messages"}
              </div>
            </div>

            {unread[user._id] > 0 && (
              <span className="bg-green-500 text-xs px-2 py-1 rounded-full">
                {unread[user._id]}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* CHAT */}
      <div className={`${!showUsers ? "flex" : "hidden"} md:flex flex-1 flex-col`}>

        {/* HEADER */}
        <div className="bg-[#202c33] p-3 flex items-center gap-3">
          <button onClick={() => setShowUsers(true)} className="md:hidden">←</button>

          <img
            src={selectedUser?.avatar || "https://i.pravatar.cc/40"}
            className="w-10 h-10 rounded-full"
          />

          <div>
            <div>{selectedUser?.name}</div>
            {onlineUsers.includes(selectedUser?._id) && (
              <div className="text-xs text-gray-400">online</div>
            )}
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#0b141a]">
          {messages.map((msg, i) => {
            const senderId = msg.sender?._id || msg.sender;
            const isMe = senderId === currentUserId;

            return (
              <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
                <div className={`max-w-xs p-2 rounded-lg ${
                  isMe ? "bg-green-500" : "bg-[#202c33]"
                }`}>
                  
                  {msg.text && <div>{msg.text}</div>}

                  {msg.image && (
                    <img src={msg.image} className="rounded mt-1" />
                  )}

                  <div className="text-[10px] text-right opacity-70">
                    {formatTime(msg.createdAt)}

                    {isMe && (
                      <span className="ml-1">
                        {msg.status === "seen" ? "✔✔" : "✔"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {typingUser === selectedUser?._id && (
            <div className="text-gray-400 text-sm">typing...</div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        {selectedUser && (
          <div className="p-3 bg-[#202c33] flex gap-2">
            <input
              type="file"
               
            onChange={(e) => handleImageUpload(e.target.files[0])}
            />

            <input
              value={message}
              onChange={handleTyping}
              placeholder="Message"
              className="flex-1 px-4 py-2 rounded-full bg-[#2a3942]"
            />

            <button onClick={sendMessage} className="bg-green-500 px-4 rounded-full">
              ➤
            </button>
          </div>
        )}
      </div>
    </div>
  );
}