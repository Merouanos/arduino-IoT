"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const device_routes_1 = __importDefault(require("./routes/device.routes"));
const reading_routes_1 = __importDefault(require("./routes/reading.routes"));
const alert_routes_1 = __importDefault(require("./routes/alert.routes"));
const simulator_routes_1 = __importDefault(require("./routes/simulator.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
    });
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/devices", device_routes_1.default);
app.use("/api", reading_routes_1.default);
app.use("/api", alert_routes_1.default);
app.use("/api", simulator_routes_1.default);
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
