import dotenv from "dotenv";
dotenv.config();
import express, { json } from "express";
import http from "http"
import userRouter from "./routers/user.route.js";
import errorHandler from "./middlewares/errorHandler.js";
import forumRouter from "./routers/forum.route.js";
import postRouter from "./routers/post.route.js";
import commentRouter from "./routers/comment.route.js";
import peerChatRouter from "./routers/peerchat.route.js";
import likeRouter from "./routers/like.route.js";
import { handleSendMessage } from "./controllers/peermessage.controller.js";
import chatbotMessageRouter from "./routers/chatbotmessage.route.js";
import chatbotConversationRouter from "./routers/chatbotcoversation.route.js";
import peerMessageRouter from "./routers/peermessage.route.js";
import mongoose from "mongoose";
import "./utils/redisClient.js";
import { initSocket } from "./utils/socket.js";

const app = express();
const server = http.createServer(app)
const io = initSocket(server);
const PORT = process.env.PORT || 3000;

app.use(json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// API routes
app.use("/api/v1/user", userRouter);

app.use("/api/v1/forum", forumRouter);

app.use("/api/v1/post", postRouter);

app.use("/api/v1/comment", commentRouter);

app.use("/api/v1/like", likeRouter);

app.use("/api/v1/peer-chat", peerChatRouter);

app.use("/api/v1/peer-message", peerMessageRouter);

app.use("/api/v1/chatbot-conversation", chatbotConversationRouter);

app.use("/api/v1/chatbot-message", chatbotMessageRouter);

io.on("connection", (socket) => {
    console.log("Socket connected --> ", socket.id)
    socket.on("sendMessage", handleSendMessage(socket))
})

// Error handling middleware - must be last
app.use(errorHandler);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => console.error("MongoDB connection error:", err));
});