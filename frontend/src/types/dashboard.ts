export interface DashboardReading {
    temperature: number;
    humidity: number;
    freeRam: number;
    temperatureStatus: number;
    humidityStatus: number;
}

export interface DashboardData {
    reading: DashboardReading;
    latencyMs: number;
}