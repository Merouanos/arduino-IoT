import { Request, Response, NextFunction } from "express";
import * as simulatorService from "../services/simulator.service";

export async function getStatus(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const deviceId = req.params.id;
        if (typeof deviceId !== "string") {
            return res.status(400).json({ message: "Invalid device ID" });
        }

        const status = await simulatorService.getStatus(
            deviceId,
            req.user.id
        );
        return res.status(200).json(status);
    } catch (error) {
        next(error);
    }
}

export async function updateStatus(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const deviceId = req.params.id;
        if (typeof deviceId !== "string") {
            return res.status(400).json({ message: "Invalid device ID" });
        }

        const status = await simulatorService.setSuspended(
            deviceId,
            req.user.id,
            req.body.suspended
        );
        return res.status(200).json(status);
    } catch (error) {
        next(error);
    }
}
