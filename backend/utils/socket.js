import { Server } from "socket.io";

let io = null;

export function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || "*",
            credentials: true
        }
    });

    return io;
}

export function getIoInstance() {
    if (!io) {
        throw new Error("Socket.io not initialized! Call initSocket first.");
    }
    return io;
}