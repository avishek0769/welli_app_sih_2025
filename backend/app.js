import express, { json } from "express";
import http from "http"
import dotenv from "dotenv";
import userRouter from "./routers/user.route.js";
import errorHandler from "./middlewares/errorHandler.js";
import forumRouter from "./routers/forum.route.js";
import postRouter from "./routers/post.route.js";
import commentRouter from "./routers/comment.route.js";
import peerChatRouter from "./routers/peerchat.route.js";
import likeRouter from "./routers/like.route.js";
import { Server } from "socket.io";
import { handleSendMessage } from "./controllers/peermessage.controller.js";
import Redis from "ioredis";

dotenv.config({
    path: "./.env",
});

const app = express();
const server = http.createServer(app)
export const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        credentials: true
    }
})
export const connection = new Redis()
const PORT = process.env.PORT || 3000;

app.use(json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// API routes
app.use("/api/v1/user", userRouter);

app.use("/api/v1/forum", forumRouter);

app.use("/api/v1/post", postRouter);

app.use("/api/v1/comment", commentRouter);

app.use("/api/v1/like", likeRouter);

app.use("/api/v1/peerChat", peerChatRouter);

io.on("connection", (socket) => {
    socket.on("sendMessage", handleSendMessage(socket))
})

// Error handling middleware - must be last
app.use(errorHandler);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});