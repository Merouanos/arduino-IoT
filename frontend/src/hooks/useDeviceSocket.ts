import { useEffect } from "react";
import {
    io,
    type Socket,
} from "socket.io-client";

import { useAuth } from "../context/AuthContext";

import type { Reading } from "../types/reading";
import type { Alert } from "../types/alert";

interface UseDeviceSocketOptions {
    deviceId: string | null;

    onStatusChange?: (
        status: "connecting" | "connected" | "disconnected" | "error"
    ) => void;

    onReading?: (
        reading: Reading
    ) => void;

    onAlert?: (
        alert: Alert
    ) => void;
}

export function useDeviceSocket({
    deviceId,
    onStatusChange,
    onReading,
    onAlert,
}: UseDeviceSocketOptions) {
    const { token } = useAuth();

    useEffect(() => {
        if (!token || !deviceId) {
            onStatusChange?.("disconnected");
            return;
        }

        onStatusChange?.("connecting");

        const socket: Socket = io(
            import.meta.env.VITE_SOCKET_URL,
            {
                auth: {
                    token,
                },
            }
        );

        socket.on("connect", () => {
            onStatusChange?.("connected");
            console.log(
                "Socket connected:",
                socket.id
            );

            socket.emit(
                "joinDevice",
                deviceId,
                (
                    response: {
                        success: boolean;
                        message?: string;
                    }
                ) => {
                    if (
                        !response.success
                    ) {
                        console.error(
                            "Failed to join device room:",
                            response.message
                        );
                    }
                }
            );
        });

        socket.on(
            "connect_error",
            (error) => {
                onStatusChange?.("error");
                console.error(
                    "Socket connection error:",
                    error.message
                );
            }
        );

        socket.on("disconnect", () => {
            onStatusChange?.("disconnected");
        });

        if (onReading) {
            socket.on(
                "reading",
                onReading
            );
        }

        if (onAlert) {
            socket.on(
                "alert",
                onAlert
            );
        }

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
        };
    }, [
        token,
        deviceId,
        onStatusChange,
        onReading,
        onAlert,
    ]);
}