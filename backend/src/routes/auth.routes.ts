import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
    registerSchema,
    loginSchema,
    updateUserSchema,
} from "../schemas/auth.schema";

const router = Router();

router.post(
    "/register",
    validate(registerSchema),
    authController.register
);

router.post(
    "/login",
    validate(loginSchema),
    authController.login
);

router.patch(
    "/me",
    authMiddleware,
    validate(updateUserSchema),
    authController.updateUser
);

export default router;