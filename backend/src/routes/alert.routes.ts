import { Router } from "express";
import * as alertController from "../controllers/alert.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { deviceAuthMiddleware } from "../middleware/deviceAuth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createAlertSchema } from "../schemas/alert.schema";

const router = Router();

router.post(
    "/devices/:id/alerts",
    deviceAuthMiddleware,
    validate(createAlertSchema),
    alertController.createAlert
);

router.get(
    "/devices/:id/alerts",
    authMiddleware,
    alertController.getDeviceAlerts
);

router.get(
    "/alerts/:id",
    authMiddleware,
    alertController.getAlert
);

router.patch(
    "/alerts/:id/resolve",
    authMiddleware,
    alertController.resolveAlert
);

export default router;