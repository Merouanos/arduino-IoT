import type { Server } from "socket.io";
import { logger } from "../lib/logger";
import * as deviceRepository from "../repositories/device.repository";

export function configureSocketHandlers(io: Server) {
    io.on("connection", (socket) => {
        logger.info("Socket connected", {
            socketId: socket.id,
            userId: socket.user.id,
        });

        socket.on(
            "joinDevice",
            async (deviceId: unknown, callback) => {
                if (typeof deviceId !== "string") {
                    callback?.({
                        success: false,
                        message: "Invalid device ID",
                    });

                    return;
                }

                try {
                    const device =
                        await deviceRepository.findByIdAndUser(
                            deviceId,
                            socket.user.id
                        );

                    if (!device) {
                        callback?.({
                            success: false,
                            message: "Device not found",
                        });

                        return;
                    }

                    await socket.join(
                        `device:${deviceId}`
                    );

                    callback?.({
                        success: true,
                    });
                } catch (error) {
                    callback?.({
                        success: false,
                        message: "Failed to join device",
                    });

                    throw error;
                }
            }
        );

        socket.on("disconnect", () => {
            logger.info("Socket disconnected", {
                socketId: socket.id,
            });
        });
    });
}