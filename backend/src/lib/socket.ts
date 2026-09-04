import { Server } from "socket.io";

let io: Server | undefined;

export function initializeSocket(server: Server) {
    io = server;
}

export function getIO(): Server {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }

    return io;
}