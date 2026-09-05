import { api } from "./client";
import type { Reading } from "../types/reading";

export async function getLatestReading(
    deviceId: string
) {
    const response =
        await api.get<{
            reading: Reading | null;
        }>(
            `/devices/${deviceId}/readings/latest`
        );

    return response.data;
}

export async function getReadingHistory(
    deviceId: string
) {
    const response =
        await api.get<{
            readings: Reading[];
        }>(
            `/devices/${deviceId}/readings`
        );

    return response.data;
}