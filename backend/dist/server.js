"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const socket_1 = require("./lib/socket");
const socket_auth_1 = require("./socket/socket.auth");
const socket_handler_1 = require("./socket/socket.handler");
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const httpServer = (0, http_1.createServer)(app_1.default);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    },
});
(0, socket_1.initializeSocket)(io);
(0, socket_auth_1.configureSocketAuth)(io);
(0, socket_handler_1.configureSocketHandlers)(io);
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
