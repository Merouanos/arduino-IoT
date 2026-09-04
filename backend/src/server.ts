import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import app from "./app";
import { initializeSocket } from "./lib/socket";
import { configureSocketAuth } from "./socket/socket.auth";
import { configureSocketHandlers } from "./socket/socket.handler";

dotenv.config();

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    },
});

initializeSocket(io);

configureSocketAuth(io);
configureSocketHandlers(io);

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});