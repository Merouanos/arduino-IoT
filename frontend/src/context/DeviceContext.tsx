import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import { getDevices } from "../api/device.api";
import type { Device } from "../types/device";

interface DeviceContextValue {
    devices: Device[];
    selectedDevice: Device | null;
    selectedDeviceId: string | null;
    isLoading: boolean;
    error: string | null;

    selectDevice: (deviceId: string) => void;
    refreshDevices: () => Promise<void>;
}

const DeviceContext =
    createContext<DeviceContextValue | undefined>(
        undefined
    );

interface DeviceProviderProps {
    children: ReactNode;
}

export function DeviceProvider({
    children,
}: DeviceProviderProps) {
    const [devices, setDevices] =
        useState<Device[]>([]);

    const [
    selectedDeviceId,
    setSelectedDeviceId,
    ] = useState<string | null>(
    () =>
        localStorage.getItem(
            "selectedDeviceId"
        )
    );

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    async function refreshDevices() {
        try {
            setIsLoading(true);
            setError(null);

            const result =
                await getDevices();

            const nextDevices =
                result.devices;

            setDevices(nextDevices);

           setSelectedDeviceId(
    (currentId) => {
        if (
            currentId &&
            nextDevices.some(
                (device) =>
                    device.id ===
                    currentId
            )
        ) {
            return currentId;
        }

        const fallback =
            nextDevices[0]?.id ??
            null;

        if (fallback) {
            localStorage.setItem(
                "selectedDeviceId",
                fallback
            );
        } else {
            localStorage.removeItem(
                "selectedDeviceId"
            );
        }

        return fallback;
    }
);
        } catch {
            setError(
                "Failed to load devices"
            );
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void refreshDevices();
    }, []);

    function selectDevice(
    deviceId: string
    ) {
        localStorage.setItem(
        "selectedDeviceId",
        deviceId
        );

        setSelectedDeviceId(deviceId);
    }

    const selectedDevice =
        devices.find(
            (device) =>
                device.id ===
                selectedDeviceId
        ) ?? null;

    return (
        <DeviceContext.Provider
            value={{
                devices,
                selectedDevice,
                selectedDeviceId,
                isLoading,
                error,
                selectDevice,
                refreshDevices,
            }}
        >
            {children}
        </DeviceContext.Provider>
    );
}

export function useDevices() {
    const context =
        useContext(DeviceContext);

    if (!context) {
        throw new Error(
            "useDevices must be used inside DeviceProvider"
        );
    }

    return context;
}