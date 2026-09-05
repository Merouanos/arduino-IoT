import { api } from "./client";
import type { Alert } from "../types/alert";

export async function getDeviceAlerts(
    deviceId: string
) {
    const response =
        await api.get<{
            alerts: Alert[];
        }>(
            `/devices/${deviceId}/alerts`
        );

    return response.data;
}

export async function getAlert(
    alertId: string
) {
    const response =
        await api.get<{
            alert: Alert;
        }>(`/alerts/${alertId}`);

    return response.data;
}

export async function resolveAlert(
    alertId: string
) {
    const response =
        await api.patch<{
            alert: Alert;
        }>(
            `/alerts/${alertId}/resolve`
        );

    return response.data;
}