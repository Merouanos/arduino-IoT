import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import * as deviceRepository from "../repositories/device.repository";

export async function deviceAuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { id: deviceId } = req.params;

    if (typeof deviceId !== "string") {
        return res.status(400).json({
            message: "Invalid device ID",
        });
    }

    const deviceKey = req.headers["x-device-key"];

    if (typeof deviceKey !== "string" || !deviceKey) {
        return res.status(401).json({
            message: "Device authentication required",
        });
    }

    try {
        const device = await deviceRepository.findById(deviceId);

        if (!device) {
            return res.status(401).json({
                message: "Invalid device credentials",
            });
        }

        const isValidKey = await bcrypt.compare(
            deviceKey,
            device.device_key_hash
        );

        if (!isValidKey) {
            return res.status(401).json({
                message: "Invalid device credentials",
            });
        }

        req.device = {
            id: device.id,
        };

        next();
    } catch (error) {
        next(error);
    }
}