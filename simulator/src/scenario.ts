import type { SimulationScenario } from "./types.js";
import { SIMULATION_CONFIG } from "./config.js";

const SCENARIOS: SimulationScenario[] = [
    // Normal should happen more frequently.
    "normal",
    "normal",
    "normal",
    "normal",

    "temperature-critical",
    "humidity-high-critical",
    "humidity-low-critical",
    "both-critical",
    "recovery",
];

function randomBetween(
    min: number,
    max: number
): number {
    return Math.random() * (max - min) + min;
}

function randomScenario(): SimulationScenario {
    const index = Math.floor(
        Math.random() * SCENARIOS.length
    );

    return SCENARIOS[index];
}

export class ScenarioManager {
    private currentScenario: SimulationScenario =
        "normal";

    private scenarioStartedAt = Date.now();

    private scenarioDurationMs =
        this.getRandomDuration();

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        if (SIMULATION_CONFIG.mode === "random") {
            this.currentScenario = randomScenario();
        } else {
            this.currentScenario =
                SIMULATION_CONFIG.mode;
        }

        this.scenarioStartedAt = Date.now();

        this.scenarioDurationMs =
            this.getRandomDuration();

        console.log(
            `[SCENARIO] Starting: ${this.currentScenario}`
        );

        if (SIMULATION_CONFIG.mode !== "random") {
            console.log(
                `[SCENARIO] Fixed mode enabled`
            );
        }
    }

    getScenario(): SimulationScenario {
        this.checkForTransition();

        return this.currentScenario;
    }

    private checkForTransition(): void {
        // Fixed scenario mode:
        // never automatically switch.
        if (SIMULATION_CONFIG.mode !== "random") {
            return;
        }

        const elapsed =
            Date.now() - this.scenarioStartedAt;

        if (elapsed < this.scenarioDurationMs) {
            return;
        }

        let nextScenario =
            randomScenario();

        
        while (
            nextScenario === this.currentScenario
        ) {
            nextScenario =
                randomScenario();
        }

        this.currentScenario =
            nextScenario;

        this.scenarioStartedAt =
            Date.now();

        this.scenarioDurationMs =
            this.getRandomDuration();

        console.log(
            `[SCENARIO] Switched to: ${this.currentScenario}`
        );

        console.log(
            `[SCENARIO] Duration: ${
                Math.round(
                    this.scenarioDurationMs / 1000
                )
            }s`
        );
    }

    private getRandomDuration(): number {
        return randomBetween(
            SIMULATION_CONFIG.minScenarioDurationMs,
            SIMULATION_CONFIG.maxScenarioDurationMs
        );
    }
}

export const scenarioManager =
    new ScenarioManager();