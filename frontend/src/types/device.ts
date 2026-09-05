export interface Device {
    id: string;
    userId?: string;
    name: string;
    createdAt: string;
    lastSeenAt: string | null;
}

export interface CreateDeviceData {
    name: string;
}

export interface UpdateDeviceData {
    name?: string;
}

export interface CreateDeviceResponse {
    device: Device;
    deviceKey: string;
}