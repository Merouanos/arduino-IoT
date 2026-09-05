import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { useAuth } from "../context/AuthContext";

export function useSocket(deviceId?: string) {
    const { token } = useAuth();

    const [socket, setSocket] =
        useState<Socket | null>(null);

    useEffect(() => {
        if (!token) {
            setSocket(null);
            return;
        }

        const newSocket = io(
            import.meta.env.VITE_SOCKET_URL,
            {
                auth: {
                    token,
                },
            }
        );

        newSocket.on("connect", () => {
            console.log(
                "Socket connected:",
                newSocket.id
            );

            if (!deviceId) {
                return;
            }

            newSocket.emit(
                "joinDevice",
                deviceId,
                (response: {
                    success: boolean;
                    message?: string;
                }) => {
                    console.log(
                        "Device room:",
                        response
                    );
                }
            );
        });

        newSocket.on(
            "connect_error",
            (error) => {
                console.error(
                    "Socket connection error:",
                    error.message
                );
            }
        );

        setSocket(newSocket);

        return () => {
            console.log(
                "Disconnecting socket"
            );

            newSocket.disconnect();
            setSocket(null);
        };
    }, [token, deviceId]);

    return socket;
}