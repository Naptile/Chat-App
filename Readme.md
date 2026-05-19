# 💬 MERN Real-Time Chat App (WhatsApp Style)

A full-stack real-time chat application built with the MERN stack, featuring:
- 🔥 Socket.io real-time messaging
- 🟢 Online/offline status
- ✔✔ Delivered & Seen message status
- ⌨️ Typing indicators
- 🖼️ Image sharing (Cloudinary)
- 🔔 Notification sounds
- 📱 Fully responsive WhatsApp-style UI


## 🚀 Project Overview
live url https://chat-app-lyart-nine-76.vercel.app/

---

## 🚀 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Socket.io-client

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.io

### Cloud Services
- Cloudinary (image uploads)

---

## 📂 Project Structure
client/
├── src/
│ ├── pages/
│ │ ├── Chat.jsx
│ │ ├── Login.jsx
│ │ └── Register.jsx

server/
├── models/
│ ├── User.js
│ └── Message.js
├── routes/
│ ├── authRoutes.js
│ ├── messageRoutes.js
│ └── uploadRoutes.js
├── controllers/
│ └── authController.js
├── middleware/
│ ├── authMiddleware.js
│ └── upload.js
├── config/
│ └── cloudinary.js
└── server.js


---

## ⚙️ Features

### 💬 Chat
- Send & receive messages instantly
- WhatsApp-style UI (left/right bubbles)
- Auto-scroll to latest message

### 🟢 Presence
- Real-time online users
- "Online" indicator in chat header

### ✔✔ Message Status
- ✔ Sent
- ✔✔ Delivered
- ✔✔ Seen (blue)

### ⌨️ Typing Indicator
- Shows when another user is typing

### 🖼️ Image Sharing
- Upload images via Cloudinary
- Send images in chat

### 🔔 Notifications
- Sound plays when new message arrives

### 📱 Responsive Design
- Mobile-first UI
- Sidebar switches like WhatsApp

---

## 🔐 Authentication

- JWT-based authentication
- Secure login/register
- Token stored in localStorage

---

## 🌐 Environment Variables

### Backend (.env)
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret

CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret


### Frontend (.env)
VITE_API_URL=http://localhost:5000


---

## 📦 Installation

### 1. Clone the repo
git clone https://github.com/Naptile/Chat-App.git
cd chat-app


---

### 2. Backend setup
cd server
npm install
npm run dev


---

### 3. Frontend setup
cd client
npm install
npm run dev


---

## 🔌 Socket Events

| Event          | Description |
|----------------|------------|
| sendMessage    | Send message |
| receiveMessage | Receive message |
| typing         | Typing indicator |
| stopTyping     | Stop typing |
| onlineUsers    | List of online users |
| markSeen       | Mark messages as seen |

---

## 📸 Screenshots

![Chat UI](/client/src/assets/img2.png)
![Image Messages](/client/src/assets/image.png)
![Mobile Responsive](/client/src/assets/img1.png)

---

## 🧠 Learning Highlights

This project demonstrates:

- Real-time communication with Socket.io
- JWT authentication flow
- File uploads with Cloudinary
- State management in React
- Responsive UI design with Tailwind

---

## 🚧 Future Improvements

- 🎤 Voice messages
- 📹 Video calls (WebRTC)
- 📌 Message reactions
- 🧑 User profile editing
- 🔍 Search messages

---

## 👨‍💻 Author

Built by **Naptile Peter**

---

## ⭐ Support

If you like this project:
- ⭐ Star the repo
- 🍴 Fork it
- 🚀 Build on it