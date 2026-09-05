import { api } from "./client";

export async function getSimulatorStatus(deviceId: string) {
    const response = await api.get<{ suspended: boolean }>(
        `/devices/${deviceId}/simulator`
    );

    return response.data;
}

export async function setSimulatorSuspended(
    deviceId: string,
    suspended: boolean
) {
    const response = await api.patch<{ suspended: boolean }>(
        `/devices/${deviceId}/simulator`,
        { suspended }
    );

    return response.data;
}
