"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({
            message: "Authentication required",
        });
    }
    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            message: "Invalid authorization header",
        });
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        return res.status(500).json({
            message: "JWT_SECRET is not configured",
        });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, jwtSecret);
        if (typeof payload !== "object" ||
            payload === null ||
            typeof payload.userId !== "string") {
            return res.status(401).json({
                message: "Invalid token",
            });
        }
        req.user = {
            id: payload.userId,
        };
        next();
    }
    catch {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
}
