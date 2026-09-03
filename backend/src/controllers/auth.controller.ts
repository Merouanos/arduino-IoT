import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";

export async function register(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { email, password } = req.body;

        const user = await authService.register(
            email,
            password
        );

        return res.status(201).json({
            user,
        });
    } catch (error) {
        next(error);
    }
}

export async function login(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { email, password } = req.body;

        const result = await authService.login(
            email,
            password
        );

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

export async function updateUser(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user.id;

        const {
            email,
            currentPassword,
            newPassword,
        } = req.body;

        const user = await authService.updateUser(
            userId,
            email,
            currentPassword,
            newPassword
        );

        return res.status(200).json({
            user,
        });
    } catch (error) {
        next(error);
    }
}