import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import * as simulatorController from "../controllers/simulator.controller";

const router = Router();

router.get(
    "/devices/:id/simulator",
    authMiddleware,
    simulatorController.getStatus
);

router.patch(
    "/devices/:id/simulator",
    authMiddleware,
    simulatorController.updateStatus
);

export default router;
