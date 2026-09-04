import type { SimulationScenario } from "./types.js";

export const SIMULATION_CONFIG = {
    /**
     * "random"
     *   Randomly switches between scenarios.
     *
     * Any specific scenario
     *   Forces the simulator to stay in that scenario.
     */
    mode: "random" as "random" | SimulationScenario,

    /**
     * How long a random scenario should last.
     */
    minScenarioDurationMs: 20_000,
    maxScenarioDurationMs: 45_000,

    /**
     * How frequently the simulator sends
     * a reading to the backend.
     */
    intervalMs: 2_000,
} as const;