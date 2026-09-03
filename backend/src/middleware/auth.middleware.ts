import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
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
        const payload = jwt.verify(token, jwtSecret);

        if (
            typeof payload !== "object" ||
            payload === null ||
            typeof payload.userId !== "string"
        ) {
            return res.status(401).json({
                message: "Invalid token",
            });
        }

        req.user = {
            id: payload.userId,
        };

        next();
    } catch {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
}