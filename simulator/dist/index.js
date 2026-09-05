import "dotenv/config";
import { createServer } from "node:http";
import { generateReading, setScenario, } from "./sensor.js";
import { scenarioManager, } from "./scenario.js";
import { sendReading, } from "./client.js";
import { SIMULATION_CONFIG, } from "./config.js";
const backendUrl = process.env.BACKEND_URL ??
    "http://backend:3000";
const deviceId = process.env.DEVICE_ID;
const deviceKey = process.env.DEVICE_KEY;
const controlToken = process.env.SIMULATOR_CONTROL_TOKEN;
const controlPort = Number(process.env.SIMULATOR_CONTROL_PORT ?? 4000);
if (!deviceId) {
    throw new Error("DEVICE_ID is required");
}
if (!deviceKey) {
    throw new Error("DEVICE_KEY is required");
}
const config = {
    backendUrl,
    deviceId,
    deviceKey,
};
let activeScenario = scenarioManager.getScenario();
let suspended = false;
setScenario(activeScenario);
async function runCycle() {
    if (suspended) {
        return;
    }
    try {
        const scenario = scenarioManager.getScenario();
        /**
         * Only reset the sensor simulator
         * when the scenario actually changes.
         */
        if (scenario !== activeScenario) {
            activeScenario = scenario;
            setScenario(activeScenario);
        }
        const reading = generateReading();
        console.log("[SIMULATOR]", {
            scenario: activeScenario,
            temperature: reading.temperature,
            humidity: reading.humidity,
            temperatureStatus: reading.temperature_status,
            humidityStatus: reading.humidity_status,
            freeRam: reading.free_ram,
        });
        await sendReading(config, reading);
    }
    catch (error) {
        console.error("[SIMULATOR] Failed:", error);
    }
}
const controlServer = createServer((request, response) => {
    if (!controlToken ||
        request.headers["x-simulator-token"] !== controlToken) {
        response.writeHead(401, {
            "Content-Type": "application/json",
        });
        response.end(JSON.stringify({ message: "Unauthorized" }));
        return;
    }
    if (request.method === "GET" && request.url === "/status") {
        response.writeHead(200, {
            "Content-Type": "application/json",
        });
        response.end(JSON.stringify({ suspended }));
        return;
    }
    if (request.method === "POST" &&
        (request.url === "/pause" || request.url === "/resume")) {
        suspended = request.url === "/pause";
        console.log(`[SIMULATOR] ${suspended ? "Suspended" : "Resumed"}`);
        response.writeHead(200, {
            "Content-Type": "application/json",
        });
        response.end(JSON.stringify({ suspended }));
        return;
    }
    response.writeHead(404);
    response.end();
});
console.log("[SIMULATOR] Starting...");
console.log(`[SIMULATOR] Backend: ${backendUrl}`);
console.log(`[SIMULATOR] Device: ${deviceId}`);
console.log(`[SIMULATOR] Interval: ${SIMULATION_CONFIG.intervalMs}ms`);
console.log(`[SIMULATOR] Mode: ${SIMULATION_CONFIG.mode}`);
console.log(`[SIMULATOR] Control port: ${controlPort}`);
controlServer.listen(controlPort, "0.0.0.0");
await runCycle();
setInterval(runCycle, SIMULATION_CONFIG.intervalMs);
