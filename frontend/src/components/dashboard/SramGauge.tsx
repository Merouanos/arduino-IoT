import { motion } from "framer-motion";

import {
    COLORS,
    LABELS,
    THRESHOLDS,
} from "./Constant";

interface SramGaugeProps {
    bytes: number;
    maxBytes?: number;
}

export default function SramGauge({
    bytes,
    maxBytes = THRESHOLDS.sram.maxBytes,
}: SramGaugeProps) {
    const safeBytes = Math.max(
        0,
        Math.min(bytes, maxBytes)
    );

    const percentage =
        (safeBytes / maxBytes) * 100;

    const color =
        percentage <
        THRESHOLDS.sram.criticalPct
            ? COLORS.sramCritical
            : percentage <
                THRESHOLDS.sram.lowPct
              ? COLORS.sramLow
              : COLORS.sramHealthy;

    const label =
        percentage <
        THRESHOLDS.sram.criticalPct
            ? "CRITICAL"
            : percentage < THRESHOLDS.sram.lowPct
              ? "LOW"
              : "HEALTHY";

    const usedBytes =
        maxBytes - safeBytes;

    return (
        <div className="w-full">
            <div className="mb-2.5 flex items-baseline justify-between">
                <span
                    className="font-mono text-[28px] font-bold tracking-tight"
                    style={{
                        color: COLORS.champagne,
                    }}
                >
                    {safeBytes}
                    <span
                        className="ml-1 text-[13px] font-normal"
                        style={{
                            color: COLORS.muted,
                        }}
                    >
                        B
                    </span>
                </span>

                <span
                    className="rounded-[3px] px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[2px]"
                    style={{
                        color,
                        border: `1px solid ${color}33`,
                        background: `${color}11`,
                    }}
                >
                    {label}
                </span>
            </div>

            <div
                className="h-1 overflow-hidden rounded-full"
                style={{
                    background:
                        COLORS.sramTrack,
                }}
            >
                <motion.div
                    animate={{
                        width: `${percentage}%`,
                    }}
                    transition={{
                        duration: 1.2,
                        ease: "easeOut",
                    }}
                    className="h-full rounded-full"
                    style={{
                        background: color,
                    }}
                />
            </div>

            <div
                className="mt-1.5 flex justify-between font-mono text-[11px]"
                style={{
                    color: COLORS.muted,
                }}
            >
                <span>0B</span>

                <span style={{ color }}>
                    {percentage.toFixed(0)}% free
                </span>

                <span>{maxBytes}B</span>
            </div>

            <div
                className="mt-3 rounded-lg p-2.5"
                style={{
                    background:
                        "rgba(255,255,255,0.03)",
                    border:
                        "0.5px solid rgba(255,255,255,0.06)",
                }}
            >
                <div
                    className="font-mono text-[11px] leading-loose"
                    style={{
                        color: COLORS.muted,
                    }}
                >
                    <div className="flex justify-between">
                        <span>
                            {LABELS.sramTotal}
                        </span>

                        <span
                            style={{
                                color:
                                    COLORS.champagne,
                            }}
                        >
                            {maxBytes} B
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span>
                            {LABELS.sramUsed}
                        </span>

                        <span
                            style={{
                                color:
                                    COLORS.champagne,
                            }}
                        >
                            {usedBytes.toLocaleString()} B
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span>
                            {LABELS.sramArchitecture}
                        </span>

                        <span
                            style={{
                                color:
                                    COLORS.gold,
                            }}
                        >
                            {LABELS.sramArch}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}