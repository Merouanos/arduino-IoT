import { Request, Response, NextFunction } from "express";
import * as alertService from "../services/alert.service";

export async function createAlert(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const deviceId = req.device.id;

        const {
            type,
            severity,
            message,
        } = req.body;

        const alert = await alertService.createAlert(
            deviceId,
            type,
            severity,
            message
        );

        return res.status(201).json({
            alert,
        });
    } catch (error) {
        next(error);
    }
}

export async function getDeviceAlerts(
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

        const alerts = await alertService.getDeviceAlerts(
            deviceId,
            userId
        );

        return res.status(200).json({
            alerts,
        });
    } catch (error) {
        next(error);
    }
}

export async function getAlert(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id: alertId } = req.params;

        if (typeof alertId !== "string") {
            return res.status(400).json({
                message: "Invalid alert ID",
            });
        }

        const userId = req.user.id;

        const alert = await alertService.getAlert(
            alertId,
            userId
        );

        return res.status(200).json({
            alert,
        });
    } catch (error) {
        next(error);
    }
}

export async function resolveAlert(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id: alertId } = req.params;

        if (typeof alertId !== "string") {
            return res.status(400).json({
                message: "Invalid alert ID",
            });
        }

        const userId = req.user.id;

        const alert = await alertService.resolveAlert(
            alertId,
            userId
        );

        return res.status(200).json({
            alert,
        });
    } catch (error) {
        next(error);
    }
}