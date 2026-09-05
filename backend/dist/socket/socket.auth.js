"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureSocketAuth = configureSocketAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function configureSocketAuth(io) {
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (typeof token !== "string" || !token) {
            return next(new Error("Authentication required"));
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return next(new Error("JWT_SECRET is not configured"));
        }
        try {
            const payload = jsonwebtoken_1.default.verify(token, jwtSecret);
            if (typeof payload !== "object" ||
                payload === null ||
                typeof payload.userId !== "string") {
                return next(new Error("Invalid token"));
            }
            socket.user = {
                id: payload.userId,
            };
            next();
        }
        catch {
            next(new Error("Invalid or expired token"));
        }
    });
}
