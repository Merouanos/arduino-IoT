import { useEffect, useState } from "react";

import { getDevices } from "../api/device.api";

import {
    getLatestReading,
    getReadingHistory,
} from "../api/reading.api";

import { getDeviceAlerts } from "../api/alert.api";

import type { Device } from "../types/device";
import type { Reading } from "../types/reading";
import type { Alert } from "../types/alert";

interface DashboardState {
    devices: Device[];
    selectedDeviceId: string | null;
    latestReading: Reading | null;
    readingHistory: Reading[];
    alerts: Alert[];
    isLoading: boolean;
    error: string | null;
}

export function useDashboard() {
    const [state, setState] =
        useState<DashboardState>({
            devices: [],
            selectedDeviceId: null,
            latestReading: null,
            readingHistory: [],
            alerts: [],
            isLoading: true,
            error: null,
        });

    useEffect(() => {
        async function loadDevices() {
            try {
                setState((previous) => ({
                    ...previous,
                    isLoading: true,
                    error: null,
                }));

                const result =
                    await getDevices();

                const devices =
                    result.devices;

                setState((previous) => ({
                    ...previous,
                    devices,
                    selectedDeviceId:
                        devices.length > 0
                            ? devices[0].id
                            : null,
                    isLoading: false,
                }));
            } catch {
                setState((previous) => ({
                    ...previous,
                    isLoading: false,
                    error:
                        "Failed to load devices",
                }));
            }
        }

        loadDevices();
    }, []);

    useEffect(() => {
        if (!state.selectedDeviceId) {
            return;
        }

        const deviceId =
            state.selectedDeviceId;

        async function loadDeviceData() {
            try {
                setState((previous) => ({
                    ...previous,
                    isLoading: true,
                    error: null,
                }));

                const [
                    latestResult,
                    historyResult,
                    alertsResult,
                ] = await Promise.all([
                    getLatestReading(deviceId),
                    getReadingHistory(deviceId),
                    getDeviceAlerts(deviceId),
                ]);

                setState((previous) => ({
                    ...previous,
                    latestReading:
                        latestResult.reading,
                    readingHistory:
                        historyResult.readings,
                    alerts:
                        alertsResult.alerts,
                    isLoading: false,
                }));
            } catch {
                setState((previous) => ({
                    ...previous,
                    isLoading: false,
                    error:
                        "Failed to load device data",
                }));
            }
        }

        loadDeviceData();
    }, [state.selectedDeviceId]);

    function selectDevice(
        deviceId: string
    ) {
        setState((previous) => ({
            ...previous,
            selectedDeviceId: deviceId,
            latestReading: null,
            readingHistory: [],
            alerts: [],
        }));
    }

    return {
        ...state,
        selectDevice,
    };
}