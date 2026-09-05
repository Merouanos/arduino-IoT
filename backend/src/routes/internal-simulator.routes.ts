import {
    Router,
    type Request,
    type Response,
    type NextFunction,
} from "express";

import * as readingService from "../services/reading.service";
import { validate } from "../middleware/validate.middleware";
import { readingSchema } from "../schemas/reading.schema";
import { z } from "zod";

const router = Router();
const internalReadingSchema = readingSchema.extend({
    deviceId: z.string().min(1),
});

function simulatorAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const token =
        req.headers["x-simulator-token"];

    if (
        typeof token !== "string" ||
        !process.env.SIMULATOR_CONTROL_TOKEN ||
        token !==
            process.env
                .SIMULATOR_CONTROL_TOKEN
    ) {
        return res.status(401).json({
            message:
                "Simulator authentication required",
        });
    }

    next();
}

router.post(
    "/readings",
    simulatorAuth,
    validate(internalReadingSchema),
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const {
                deviceId,
                temperature,
                humidity,
                free_ram,
                temperature_status,
                humidity_status,
            } = req.body;

            if (typeof deviceId !== "string") {
                return res.status(400).json({
                    message: "deviceId is required",
                });
            }

            const reading =
                await readingService.createReading(
                    deviceId,
                    {
                        temperature,
                        humidity,
                        free_ram,
                        temperature_status,
                        humidity_status,
                    }
                );

            return res.status(201).json({
                reading,
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;