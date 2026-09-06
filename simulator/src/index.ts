import "dotenv/config";
import { createServer } from "node:http";

import {
    getSession,
    resumeSession,
    startSession,
    stopSession,
    suspendSession,
} from "./session.js";
import type { SessionScenario } from "./session.js";
import { sendReading } from "./client.js";

const controlToken =
    process.env.SIMULATOR_CONTROL_TOKEN;

const controlPort = Number(
    process.env.PORT ??
    process.env.SIMULATOR_CONTROL_PORT ??
    4000
);

const scenarios = new Set([
    "random",
    "normal",
    "temperature-critical",
    "humidity-high-critical",
    "humidity-low-critical",
    "both-critical",
    "recovery",
]);

function sendJson(
    response: import("node:http").ServerResponse,
    status: number,
    body: unknown
) {
    response.writeHead(status, {
        "Content-Type": "application/json",
    });
    response.end(JSON.stringify(body));
}

async function readBody(
    request: import("node:http").IncomingMessage
) {
    let body = "";

    for await (const chunk of request) {
        body += chunk;
    }

    if (!body) {
        return {};
    }

    try {
        return JSON.parse(body) as Record<string, unknown>;
    } catch {
        return null;
    }
}

const controlServer = createServer(async (request, response) => {
    if (
        !controlToken ||
        request.headers["x-simulator-token"] !== controlToken
    ) {
        sendJson(response, 401, { message: "Unauthorized" });
        return;
    }

    const url = new URL(
        request.url ?? "/",
        "http://simulator.local"
    );

    if (
        request.method === "GET" &&
        url.pathname.startsWith("/sessions/")
    ) {
        const deviceId = decodeURIComponent(
            url.pathname.slice("/sessions/".length)
        );
        const session = getSession(deviceId);

        sendJson(response, 200, session
            ? {
                active: true,
                deviceId: session.deviceId,
                scenario: session.scenario,
                suspended: session.suspended,
            }
            : { active: false, suspended: true });
        return;
    }

    if (request.method !== "POST") {
        sendJson(response, 404, { message: "Not found" });
        return;
    }

    const body = await readBody(request);
    const deviceId = body && body.deviceId;

    if (
        !body ||
        typeof deviceId !== "string" ||
        deviceId.length === 0
    ) {
        sendJson(response, 400, {
            message: "deviceId is required",
        });
        return;
    }

    try {
        if (url.pathname === "/sessions/start") {
            const requestedScenario = body.scenario ?? "random";

            if (
                typeof requestedScenario !== "string" ||
                !scenarios.has(requestedScenario)
            ) {
                sendJson(response, 400, {
                    message: "Invalid simulator scenario",
                });
                return;
            }

            const session = startSession(
                deviceId,
                requestedScenario as SessionScenario,
                sendReading
            );

            sendJson(response, 200, {
                active: true,
                deviceId: session.deviceId,
                scenario: session.scenario,
                suspended: session.suspended,
            });
            return;
        }

        if (url.pathname === "/sessions/stop") {
            stopSession(deviceId);
            sendJson(response, 200, {
                active: false,
                suspended: true,
            });
            return;
        }

        if (url.pathname === "/sessions/suspend") {
            suspendSession(deviceId);
        } else if (url.pathname === "/sessions/resume") {
            resumeSession(deviceId);
        } else {
            sendJson(response, 404, { message: "Not found" });
            return;
        }

        const session = getSession(deviceId);
        sendJson(response, 200, {
            active: Boolean(session),
            suspended: session?.suspended ?? true,
        });
    } catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Simulator request failed";
        const status = message === "Simulator capacity reached"
            ? 503
            : 500;

        sendJson(response, status, { message });
    }
});

console.log(
    `[SIMULATOR] Control server listening on port ${controlPort}`
);

controlServer.listen(controlPort, "0.0.0.0");
