"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = initializeSocket;
exports.getIO = getIO;
let io;
function initializeSocket(server) {
    io = server;
}
function getIO() {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }
    return io;
}
