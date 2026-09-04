import jwt from "jsonwebtoken";
import type { Server } from "socket.io";

export function configureSocketAuth(io: Server) {
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
            const payload = jwt.verify(token, jwtSecret);

            if (
                typeof payload !== "object" ||
                payload === null ||
                typeof payload.userId !== "string"
            ) {
                return next(new Error("Invalid token"));
            }

            socket.user = {
                id: payload.userId,
            };

            next();
        } catch {
            next(new Error("Invalid or expired token"));
        }
    });
}