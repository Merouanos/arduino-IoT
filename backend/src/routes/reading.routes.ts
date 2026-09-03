import { Router } from "express";
import * as readingController from "../controllers/reading.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { deviceAuthMiddleware } from "../middleware/deviceAuth.middleware";
import { validate } from "../middleware/validate.middleware";
import { readingSchema } from "../schemas/reading.schema";

const router = Router();

router.post(
    "/devices/:id/readings",
    deviceAuthMiddleware,
    validate(readingSchema),
    readingController.createReading
);

router.get(
    "/devices/:id/readings/latest",
    authMiddleware,
    readingController.getLatestReading
);

router.get(
    "/devices/:id/readings",
    authMiddleware,
    readingController.getReadingHistory
);

export default router;