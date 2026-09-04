import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";
import { AppError } from "../lib/app.error";

export function errorMiddleware(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
) {
    if (err instanceof AppError) {
        logger.warn("Application error", {
            message: err.message,
            statusCode: err.statusCode,
            method: req.method,
            path: req.path,
        });

        return res.status(err.statusCode).json({
            message: err.message,
        });
    }

    logger.error("Unhandled application error", {
        error: err,
        method: req.method,
        path: req.path,
    });

    return res.status(500).json({
        message: "Internal server error",
    });
}