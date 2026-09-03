import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

export function errorMiddleware(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
) {
    logger.error("Unhandled application error", {
        error: err,
        method: req.method,
        path: req.path,
    });

    return res.status(500).json({
        message: "Internal server error",
    });
}