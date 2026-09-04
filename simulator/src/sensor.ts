import type {
    SensorReading,
    SensorStatus,
    SimulationScenario,
} from "./types.js";

function getStatus(
    value: number,
    upperWarningThreshold: number,
    upperCriticalThreshold: number,
    lowerWarningThreshold?: number,
    lowerCriticalThreshold?: number
): SensorStatus {
    // Critical thresholds must always be
    // evaluated before warning thresholds.

    if (value >= upperCriticalThreshold) {
        return "critical";
    }

    if (
        lowerCriticalThreshold !== undefined &&
        value <= lowerCriticalThreshold
    ) {
        return "critical";
    }

    if (value >= upperWarningThreshold) {
        return "warning";
    }

    if (
        lowerWarningThreshold !== undefined &&
        value <= lowerWarningThreshold
    ) {
        return "warning";
    }

    return "normal";
}

function clamp(
    value: number,
    min: number,
    max: number
): number {
    return Math.min(
        Math.max(value, min),
        max
    );
}

function randomBetween(
    min: number,
    max: number
): number {
    return Math.random() * (max - min) + min;
}

/**
 * Produces a small random movement.
 *
 * This makes sensor values drift gradually
 * instead of jumping randomly between unrelated values.
 */
function randomDrift(
    amount: number
): number {
    return randomBetween(
        -amount,
        amount
    );
}

class SensorSimulator {
    private temperature = 25;
    private humidity = 55;
    private freeRam = 1400;

    private scenario: SimulationScenario =
        "normal";

    private step = 0;

    setScenario(
        scenario: SimulationScenario
    ): void {
        // Don't reset the simulator if the
        // scenario hasn't actually changed.
        if (this.scenario === scenario) {
            return;
        }

        this.scenario = scenario;
        this.step = 0;

        switch (scenario) {
            case "normal":
                this.temperature = 25;
                this.humidity = 55;
                break;

            case "temperature-critical":
                this.temperature = 25;
                this.humidity = 55;
                break;

            case "humidity-high-critical":
                this.temperature = 25;
                this.humidity = 55;
                break;

            case "humidity-low-critical":
                this.temperature = 25;
                this.humidity = 55;
                break;

            case "both-critical":
                this.temperature = 25;
                this.humidity = 55;
                break;

            case "recovery":
                // Start in a dangerous state.
                this.temperature = 36;
                this.humidity = 17;
                break;
        }

        console.log(
            `[SENSOR] Scenario initialized: ${scenario}`
        );
    }

    generateReading(): SensorReading {
        this.updateSensorValues();

        return {
            temperature: Number(
                this.temperature.toFixed(1)
            ),

            humidity: Number(
                this.humidity.toFixed(1)
            ),

            free_ram: Math.floor(
                this.freeRam
            ),

            temperature_status: getStatus(
                this.temperature,
                30,
                35
            ),

            humidity_status: getStatus(
                this.humidity,
                70,
                85,
                30,
                20
            ),
        };
    }

    private updateSensorValues(): void {
        switch (this.scenario) {
            case "normal":
                this.updateNormal();
                break;

            case "temperature-critical":
                this.updateTemperatureCritical();
                break;

            case "humidity-high-critical":
                this.updateHumidityHighCritical();
                break;

            case "humidity-low-critical":
                this.updateHumidityLowCritical();
                break;

            case "both-critical":
                this.updateBothCritical();
                break;

            case "recovery":
                this.updateRecovery();
                break;
        }

        this.updateFreeRam();
    }

    private updateNormal(): void {
        this.temperature += randomDrift(0.4);
        this.humidity += randomDrift(1.0);

        this.temperature = clamp(
            this.temperature,
            22,
            28
        );

        this.humidity = clamp(
            this.humidity,
            45,
            65
        );
    }

    private updateTemperatureCritical(): void {
        this.step++;

        /**
         * First spend several readings in a
         * normal range before the temperature
         * starts climbing.
         */
        if (this.step <= 4) {
            this.temperature += randomDrift(0.3);
            this.humidity += randomDrift(0.8);

            this.temperature = clamp(
                this.temperature,
                24,
                27
            );

            this.humidity = clamp(
                this.humidity,
                50,
                60
            );

            return;
        }

        /**
         * Gradually increase temperature.
         *
         * 30°C  -> warning
         * 35°C  -> critical
         */
        this.temperature += randomBetween(
            0.7,
            1.4
        );

        this.humidity += randomDrift(0.7);

        this.temperature = clamp(
            this.temperature,
            24,
            37
        );

        this.humidity = clamp(
            this.humidity,
            45,
            65
        );
    }

    private updateHumidityHighCritical(): void {
        this.step++;

        if (this.step <= 4) {
            this.temperature += randomDrift(0.3);
            this.humidity += randomDrift(0.8);

            this.temperature = clamp(
                this.temperature,
                24,
                27
            );

            this.humidity = clamp(
                this.humidity,
                50,
                60
            );

            return;
        }

        /**
         * Gradually increase humidity.
         *
         * 70% -> warning
         * 85% -> critical
         */
        this.humidity += randomBetween(
            1.5,
            3
        );

        this.temperature += randomDrift(0.4);

        this.temperature = clamp(
            this.temperature,
            23,
            28
        );

        this.humidity = clamp(
            this.humidity,
            50,
            90
        );
    }

    private updateHumidityLowCritical(): void {
        this.step++;

        if (this.step <= 4) {
            this.temperature += randomDrift(0.3);
            this.humidity += randomDrift(0.8);

            this.temperature = clamp(
                this.temperature,
                24,
                27
            );

            this.humidity = clamp(
                this.humidity,
                50,
                60
            );

            return;
        }

        /**
         * Gradually decrease humidity.
         *
         * 30% -> warning
         * 20% -> critical
         */
        this.humidity -= randomBetween(
            1.5,
            3
        );

        this.temperature += randomDrift(0.4);

        this.temperature = clamp(
            this.temperature,
            23,
            28
        );

        this.humidity = clamp(
            this.humidity,
            15,
            60
        );
    }

    private updateBothCritical(): void {
        this.step++;

        if (this.step <= 4) {
            this.temperature += randomDrift(0.3);
            this.humidity += randomDrift(0.8);

            this.temperature = clamp(
                this.temperature,
                24,
                27
            );

            this.humidity = clamp(
                this.humidity,
                50,
                60
            );

            return;
        }

        /**
         * Temperature rises while humidity falls.
         *
         * This should eventually produce:
         *
         * temperature -> warning -> critical
         * humidity    -> warning -> critical
         */
        this.temperature += randomBetween(
            0.8,
            1.5
        );

        this.humidity -= randomBetween(
            1.5,
            3
        );

        this.temperature = clamp(
            this.temperature,
            24,
            37
        );

        this.humidity = clamp(
            this.humidity,
            15,
            60
        );
    }

    private updateRecovery(): void {
        /**
         * Start at:
         *
         * temperature = 36°C
         * humidity    = 17%
         *
         * and gradually return toward normal.
         */
        if (this.temperature > 25) {
            this.temperature -= randomBetween(
                0.7,
                1.3
            );
        }

        if (this.humidity < 55) {
            this.humidity += randomBetween(
                1.5,
                3
            );
        }

        // Add some natural sensor noise.
        this.temperature += randomDrift(0.2);
        this.humidity += randomDrift(0.5);

        this.temperature = clamp(
            this.temperature,
            22,
            36
        );

        this.humidity = clamp(
            this.humidity,
            15,
            65
        );
    }

    private updateFreeRam(): void {
        /**
         * Simulate small SRAM fluctuations.
         */
        this.freeRam += Math.floor(
            randomDrift(25)
        );

        this.freeRam = clamp(
            this.freeRam,
            900,
            1800
        );
    }
}

export const sensorSimulator =
    new SensorSimulator();

export function setScenario(
    scenario: SimulationScenario
): void {
    sensorSimulator.setScenario(
        scenario
    );
}

export function generateReading(): SensorReading {
    return sensorSimulator.generateReading();
}