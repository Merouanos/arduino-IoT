import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import deviceRoutes from "./routes/device.routes";
import readingRoutes from "./routes/reading.routes";
import alertRoutes from "./routes/alert.routes";
import simulatorRoutes from "./routes/simulator.routes";
import internalSimulatorRoutes from "./routes/internal-simulator.routes";

import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api", readingRoutes);
app.use("/api", alertRoutes);
app.use("/api", simulatorRoutes);
app.use(
    "/internal/simulator",
    internalSimulatorRoutes
);

app.use(errorMiddleware);

export default app;