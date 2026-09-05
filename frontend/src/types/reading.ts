export interface Reading {
    id: string;
    device_id: string;
    temperature: number;
    humidity: number;
    free_ram: number;
    temperature_status: number;
    humidity_status: number;
    recorded_at: string;
}

export type SensorStatus =
    | "normal"
    | "warning"
    | "critical";