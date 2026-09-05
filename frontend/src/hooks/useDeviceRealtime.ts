import { useEffect } from "react";
import type { Socket } from "socket.io-client";

import type { Reading } from "../types/reading";
import type { Alert } from "../types/alert";

interface DeviceRealtimeHandlers {
    onReading?: (reading: Reading) => void;
    onAlert?: (alert: Alert) => void;
}

export function useDeviceRealtime(
    socket: Socket | null,
    handlers: DeviceRealtimeHandlers
) {
    useEffect(() => {
        if (!socket) {
            return;
        }

        const handleReading = (
            reading: Reading
        ) => {
            handlers.onReading?.(reading);
        };

        const handleAlert = (
            alert: Alert
        ) => {
            handlers.onAlert?.(alert);
        };

        socket.on(
            "reading",
            handleReading
        );

        socket.on(
            "alert",
            handleAlert
        );

        return () => {
            socket.off(
                "reading",
                handleReading
            );

            socket.off(
                "alert",
                handleAlert
            );
        };
    }, [socket, handlers]);
}