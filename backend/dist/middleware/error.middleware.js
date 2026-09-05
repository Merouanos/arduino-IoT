"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const logger_1 = require("../lib/logger");
const app_error_1 = require("../lib/app.error");
function errorMiddleware(err, req, res, _next) {
    if (err instanceof app_error_1.AppError) {
        logger_1.logger.warn("Application error", {
            message: err.message,
            statusCode: err.statusCode,
            method: req.method,
            path: req.path,
        });
        return res.status(err.statusCode).json({
            message: err.message,
        });
    }
    logger_1.logger.error("Unhandled application error", {
        error: err,
        method: req.method,
        path: req.path,
    });
    return res.status(500).json({
        message: "Internal server error",
    });
}
