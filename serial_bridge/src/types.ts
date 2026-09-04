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