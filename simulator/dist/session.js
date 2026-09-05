import { SensorSimulator, } from "./sensor.js";
import { ScenarioManager, } from "./scenario.js";
const MAX_SESSIONS = 5;
const sessions = new Map();
export function getSession(deviceId) {
    return sessions.get(deviceId);
}
export function startSession(deviceId, scenario, sendReading) {
    const existing = sessions.get(deviceId);
    if (existing) {
        existing.scenario = scenario;
        existing.suspended = false;
        existing.randomScenario = scenario === "random"
            ? new ScenarioManager()
            : null;
        existing.sensor.setScenario(scenario === "random" ? "normal" : scenario);
        return existing;
    }
    if (sessions.size >= MAX_SESSIONS) {
        throw new Error("Simulator capacity reached");
    }
    const session = {
        deviceId,
        scenario,
        sensor: new SensorSimulator(scenario === "random" ? "normal" : scenario),
        randomScenario: scenario === "random"
            ? new ScenarioManager()
            : null,
        timer: null,
        suspended: false,
    };
    const tick = async () => {
        if (session.suspended) {
            return;
        }
        const activeScenario = session.scenario === "random"
            ? session.randomScenario.getScenario()
            : session.scenario;
        session.sensor.setScenario(activeScenario);
        try {
            await sendReading(session.deviceId, session.sensor.generateReading());
        }
        catch (error) {
            console.error("[SIMULATOR] Failed to send simulated reading:", error);
        }
    };
    session.timer = setInterval(() => void tick(), 2000);
    sessions.set(deviceId, session);
    void tick();
    return session;
}
export function stopSession(deviceId) {
    const session = sessions.get(deviceId);
    if (!session) {
        return;
    }
    if (session.timer) {
        clearInterval(session.timer);
    }
    sessions.delete(deviceId);
}
export function suspendSession(deviceId) {
    const session = sessions.get(deviceId);
    if (session) {
        session.suspended = true;
    }
}
export function resumeSession(deviceId) {
    const session = sessions.get(deviceId);
    if (session) {
        session.suspended = false;
    }
}
