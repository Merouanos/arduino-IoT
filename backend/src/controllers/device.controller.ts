import { Request, Response, NextFunction } from "express";
import * as deviceService from "../services/device.service";

export async function createDevice(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user.id;
        const { name } = req.body;

        const result = await deviceService.createDevice(
            userId,
            name
        );

        return res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

export async function getUserDevices(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user.id;

        const devices = await deviceService.getUserDevices(
            userId
        );

        return res.status(200).json({
            devices,
        });
    } catch (error) {
        next(error);
    }
}

export async function getDevice(
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

        const device = await deviceService.getDevice(
            deviceId,
            userId
        );

        return res.status(200).json({
            device,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateDevice(
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
        const { name } = req.body;

        const device = await deviceService.updateDevice(
            deviceId,
            userId,
            name
        );

        return res.status(200).json({
            device,
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteDevice(
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

        const result = await deviceService.deleteDevice(
            deviceId,
            userId
        );

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

export async function regenerateDeviceKey(
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

        const result =
            await deviceService.regenerateDeviceKey(
                deviceId,
                userId
            );

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}