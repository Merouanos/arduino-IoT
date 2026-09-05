import { api } from "./client";
import type {
    CreateDeviceData,
    CreateDeviceResponse,
    Device,
    UpdateDeviceData,
} from "../types/device";

export async function getDevices() {
    const response = await api.get<{
        devices: Device[];
    }>("/devices");

    return response.data;
}

export async function createDevice(
    data: CreateDeviceData
) {
    const response =
        await api.post<CreateDeviceResponse>(
            "/devices",
            data
        );

    return response.data;
}

export async function getDevice(
    deviceId: string
) {
    const response =
        await api.get<{
            device: Device;
        }>(`/devices/${deviceId}`);

    return response.data;
}

export async function updateDevice(
    deviceId: string,
    data: UpdateDeviceData
) {
    const response =
        await api.patch<{
            device: Device;
        }>(
            `/devices/${deviceId}`,
            data
        );

    return response.data;
}

export async function deleteDevice(
    deviceId: string
) {
    const response =
        await api.delete<{
            id: string;
        }>(`/devices/${deviceId}`);

    return response.data;
}

export async function regenerateDeviceKey(
    deviceId: string
) {
    const response =
        await api.post<{
            deviceId: string;
            deviceKey: string;
        }>(
            `/devices/${deviceId}/regenerate-key`
        );

    return response.data;
}