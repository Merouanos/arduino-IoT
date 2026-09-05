import {
	SensorSimulator,
} from "./sensor.js";
import {
	ScenarioManager,
} from "./scenario.js";
import type {
	SensorReading,
	SimulationScenario,
} from "./types.js";

export type SessionScenario =
	| "random"
	| SimulationScenario;

export interface SimulationSession {
	deviceId: string;
	scenario: SessionScenario;
	sensor: SensorSimulator;
	randomScenario: ScenarioManager | null;
	timer: NodeJS.Timeout | null;
	suspended: boolean;
}

const MAX_SESSIONS = 5;
const sessions = new Map<string, SimulationSession>();

export function getSession(deviceId: string) {
	return sessions.get(deviceId);
}

export function startSession(
	deviceId: string,
	scenario: SessionScenario,
	sendReading: (
		deviceId: string,
		reading: SensorReading
	) => Promise<void>
) {
	const existing = sessions.get(deviceId);

	if (existing) {
		existing.scenario = scenario;
		existing.suspended = false;
		existing.randomScenario = scenario === "random"
			? new ScenarioManager()
			: null;
		existing.sensor.setScenario(
			scenario === "random" ? "normal" : scenario
		);
		return existing;
	}

	if (sessions.size >= MAX_SESSIONS) {
		throw new Error("Simulator capacity reached");
	}

	const session: SimulationSession = {
		deviceId,
		scenario,
		sensor: new SensorSimulator(
			scenario === "random" ? "normal" : scenario
		),
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
			? session.randomScenario!.getScenario()
			: session.scenario;

		session.sensor.setScenario(activeScenario);

		try {
			await sendReading(
				session.deviceId,
				session.sensor.generateReading()
			);
		} catch (error) {
			console.error(
				"[SIMULATOR] Failed to send simulated reading:",
				error
			);
		}
	};

	session.timer = setInterval(() => void tick(), 2000);
	sessions.set(deviceId, session);
	void tick();

	return session;
}

export function stopSession(deviceId: string) {
	const session = sessions.get(deviceId);

	if (!session) {
		return;
	}

	if (session.timer) {
		clearInterval(session.timer);
	}

	sessions.delete(deviceId);
}

export function suspendSession(deviceId: string) {
	const session = sessions.get(deviceId);

	if (session) {
		session.suspended = true;
	}
}

export function resumeSession(deviceId: string) {
	const session = sessions.get(deviceId);

	if (session) {
		session.suspended = false;
	}
}
