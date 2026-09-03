import { Router } from "express";
import * as deviceController from "../controllers/device.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
    createDeviceSchema,
    updateDeviceSchema,
} from "../schemas/device.schema";

const router = Router();

router.post(
    "/",
    authMiddleware,
    validate(createDeviceSchema),
    deviceController.createDevice
);

router.get(
    "/",
    authMiddleware,
    deviceController.getUserDevices
);

router.get(
    "/:id",
    authMiddleware,
    deviceController.getDevice
);

router.patch(
    "/:id",
    authMiddleware,
    validate(updateDeviceSchema),
    deviceController.updateDevice
);

router.delete(
    "/:id",
    authMiddleware,
    deviceController.deleteDevice
);

router.post(
    "/:id/regenerate-key",
    authMiddleware,
    deviceController.regenerateDeviceKey
);

export default router;