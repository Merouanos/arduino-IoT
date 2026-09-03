import { Request, Response, NextFunction } from "express";
import * as readingService from "../services/reading.service";

export async function createReading(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const deviceId = req.device.id;
        const data = req.body;

        const reading = await readingService.createReading(
            deviceId,
            data
        );

        return res.status(201).json({
            reading,
        });
    } catch (error) {
        next(error);
    }
}

export async function getLatestReading(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id: deviceId } = req.params;

        if (typeof deviceId !== "string") {
            return res.status(400).json({
                message: "Invalid device ID",
            });
        }

        const userId = req.user.id;

        const reading =
            await readingService.getLatestReading(
                deviceId,
                userId
            );

        return res.status(200).json({
            reading,
        });
    } catch (error) {
        next(error);
    }
}

export async function getReadingHistory(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id: deviceId } = req.params;

        if (typeof deviceId !== "string") {
            return res.status(400).json({
                message: "Invalid device ID",
            });
        }

        const userId = req.user.id;

        const readings =
            await readingService.getReadingHistory(
                deviceId,
                userId
            );

        return res.status(200).json({
            readings,
        });
    } catch (error) {
        next(error);
    }
}