import { motion } from "framer-motion";
import { useState } from "react";

import type { Device } from "../../types/device";

import {
    ANIMATION,
    COLORS,
    DEVICE_STATUS,
    getDeviceStatus,
    LABELS,
} from "./Constant";

interface DeviceCardProps {
    device: Device;
    selected?: boolean;
    onSelect: (deviceId: string) => void;
    onOpenDetails?: (deviceId: string) => void;
}

export default function DeviceCard({
    device,
    selected = false,
    onSelect,
    onOpenDetails,
}: DeviceCardProps) {
    const [copied, setCopied] = useState(false);

    const status =
        getDeviceStatus(
            device.lastSeenAt
        );

    const statusColor =
        status === DEVICE_STATUS.ONLINE
            ? COLORS.nominal
            : status === DEVICE_STATUS.STALE
              ? COLORS.warning
              : COLORS.critical;

    async function handleClick() {
        onSelect(device.id);

        try {
            await navigator.clipboard.writeText(device.id);
        } catch {
            const textArea = document.createElement("textarea");
            textArea.value = device.id;
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            textArea.remove();
        }

        setCopied(true);
        onOpenDetails?.(device.id);
        window.setTimeout(() => setCopied(false), 1600);
    }

    return (
        <motion.button
            type="button"
            onClick={() => void handleClick()}
            title="Select device and copy its ID"
            whileHover={{
                y: -2,
            }}
            transition={{
                duration:
                    ANIMATION.cardDuration,
            }}
            className="group relative w-full overflow-hidden rounded-2xl p-5 text-left"
            style={{
                background:
                    COLORS.cardBg,
                border: `1px solid ${
                    selected
                        ? COLORS.cardBorderSelected
                        : COLORS.cardBorder
                }`,
            }}
        >
            {/* top shimmer */}
            <div
                className="absolute left-0 right-0 top-0 h-px"
                style={{
                    background: `linear-gradient(
                        90deg,
                        transparent,
                        ${
                            selected
                                ? COLORS.gold
                                : COLORS.shimmer
                        },
                        transparent
                    )`,
                }}
            />

            <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                        <div
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                                background:
                                    statusColor,
                                boxShadow:
                                    status ===
                                    DEVICE_STATUS.ONLINE
                                        ? `0 0 8px ${statusColor}`
                                        : "none",
                            }}
                        />

                        <span
                            className="font-mono text-[10px] font-semibold tracking-[2px]"
                            style={{
                                color:
                                    statusColor,
                            }}
                        >
                            {status}
                        </span>
                    </div>

                    <h3
                        className="truncate text-[17px] font-medium"
                        style={{
                            color:
                                COLORS.champagne,
                        }}
                    >
                        {device.name}
                    </h3>

                    <p
                        className="mt-2 truncate font-mono text-[10px] tracking-[0.5px]"
                        style={{
                            color:
                                COLORS.muted,
                        }}
                    >
                        {copied
                            ? "ID COPIED"
                            : `${LABELS.deviceId} · ${device.id}`}
                    </p>
                </div>

                <div
                    className="shrink-0 text-right"
                    style={{
                        color:
                            COLORS.muted,
                    }}
                >
                    <div className="font-mono text-[9px] uppercase tracking-[1.5px]">
                        {LABELS.lastSeen}
                    </div>

                    <div
                        className="mt-1 font-mono text-[11px]"
                        style={{
                            color:
                                COLORS.champagne,
                        }}
                    >
                        {device.lastSeenAt
                            ? new Date(
                                  device.lastSeenAt
                              ).toLocaleTimeString()
                            : "NEVER"}
                    </div>
                </div>
            </div>

            <div
                className="mt-5 flex items-center justify-between border-t pt-3"
                style={{
                    borderColor:
                        "rgba(255,255,255,0.05)",
                }}
            >
                <span
                    className="font-mono text-[9px] tracking-[1.5px]"
                    style={{
                        color:
                            COLORS.muted,
                    }}
                >
                    {LABELS.created}
                </span>

                <span
                    className="font-mono text-[10px]"
                    style={{
                        color:
                            COLORS.subtle,
                    }}
                >
                    {new Date(
                        device.createdAt
                    ).toLocaleDateString()}
                </span>
            </div>
        </motion.button>
    );
}