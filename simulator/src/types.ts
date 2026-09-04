export type SensorStatus =
    | "normal"
    | "warning"
    | "critical";

export interface SensorReading {
    temperature: number;
    humidity: number;
    free_ram: number;
    temperature_status: SensorStatus;
    humidity_status: SensorStatus;
}

export type SimulationScenario =
    | "normal"
    | "temperature-critical"
    | "humidity-high-critical"
    | "humidity-low-critical"
    | "both-critical"
    | "recovery";