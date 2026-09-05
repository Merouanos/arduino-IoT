import {
    useEffect,
    useState,
} from "react";
import { motion } from "framer-motion";

import {
    ANIMATION,
    COLORS,
    LABELS,
    LAYOUT,
    THRESHOLDS,
    resolveStatus,
    type DashboardStatus,
} from "./Constant";

import AnimatedValue from "./AnimatedValue";
import Card from "./Card";
import CardLabel from "./CardLabel";
import HeatGrid from "./HeatGrid";
import PersistenceBar from "./PersistenceBar";
import RechartsSparkline from "./RechartsSparkline";
import SramGauge from "./SramGauge";
import StatusBadge from "./StatusBadge";

import type { DashboardReading } from "../../types/dashboard";

interface ClimatProps {
    data: DashboardReading;
    temperatureHistory: number[];
    latencyMs?: number;
}

const DEFAULT_READING: DashboardReading = {
    temperature: 24,
    humidity: 50,
    freeRam: 2048,
    temperatureStatus: 0,
    humidityStatus: 0,
};

export default function Climat({
    data = DEFAULT_READING,
    temperatureHistory,
    latencyMs = 0,
}: ClimatProps) {
    const {
        temperature,
        humidity,
        freeRam,
        temperatureStatus,
        humidityStatus,
    } = data;

    const tempState =
        resolveStatus(temperatureStatus);

    const humState =
        resolveStatus(humidityStatus);

    const systemState: DashboardStatus =
        temperatureStatus >= humidityStatus
            ? tempState
            : humState;

    const isCritical =
        systemState === "CRITICAL";

    const isWarning =
        systemState === "WARNING" ||
        isCritical;

    const [tempHistory, setTempHistory] =
        useState<number[]>(
            temperatureHistory
        );

    useEffect(() => {
        setTempHistory(
            temperatureHistory.length > 0
                ? temperatureHistory
                : [temperature]
        );
    }, [temperatureHistory, temperature]);

    useEffect(() => {
        setTempHistory((previous) => {
            const lastValue =
                previous[
                    previous.length - 1
                ];

            if (lastValue === temperature) {
                return previous;
            }

            return [
                ...previous.slice(
                    -(LAYOUT.historyWindow - 1)
                ),
                temperature,
            ];
        });
    }, [temperature]);

    const tempMin = Math.min(
        ...tempHistory
    ).toFixed(1);

    const tempMax = Math.max(
        ...tempHistory
    ).toFixed(1);

    const tempAvg = (
        tempHistory.reduce(
            (sum, value) => sum + value,
            0
        ) / tempHistory.length
    ).toFixed(1);

    const tempColor =
        tempState === "CRITICAL"
            ? COLORS.critical
            : tempState === "WARNING"
              ? COLORS.warning
              : COLORS.champagne;

    const humidityColor =
        humState === "CRITICAL"
            ? COLORS.critical
            : humState === "WARNING"
              ? COLORS.sramLow
              : COLORS.champagne;

    const humidityBarColor =
        humidity >
        THRESHOLDS.humidity.warningHigh
            ? COLORS.humidityHigh
            : humidity <
                THRESHOLDS.humidity.warningLow
              ? COLORS.humidityLow
              : COLORS.humidityNormal;

    const deltaColor =
        temperature >
        THRESHOLDS.temp.baseline
            ? COLORS.deltaHot
            : COLORS.deltaCold;

    return (
        <div
            className="relative min-h-screen overflow-x-hidden bg-black"
            style={{
                color: COLORS.champagne,
            }}
        >
            <div
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    background: `radial-gradient(
                        ellipse 80% 50% at 50% -10%,
                        ${COLORS.ambientGlow},
                        transparent 70%
                    )`,
                }}
            />

            <header
                className="sticky top-0 z-10 flex items-center justify-between px-7 py-4"
                style={{
                    background:
                        COLORS.headerBg,
                    backdropFilter:
                        "blur(24px)",
                    borderBottom: `0.5px solid ${COLORS.headerBorder}`,
                }}
            >
                <div className="flex items-center gap-3.5">
                    <svg
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        aria-hidden="true"
                    >
                        <circle
                            cx="11"
                            cy="11"
                            r="10"
                            stroke={COLORS.gold}
                            strokeWidth="1"
                            opacity="0.5"
                        />

                        <circle
                            cx="11"
                            cy="11"
                            r="5"
                            fill={COLORS.gold}
                            opacity="0.8"
                        />

                        <line
                            x1="11"
                            y1="1"
                            x2="11"
                            y2="5"
                            stroke={COLORS.gold}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />

                        <line
                            x1="11"
                            y1="17"
                            x2="11"
                            y2="21"
                            stroke={COLORS.gold}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />

                        <line
                            x1="1"
                            y1="11"
                            x2="5"
                            y2="11"
                            stroke={COLORS.gold}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />

                        <line
                            x1="17"
                            y1="11"
                            x2="21"
                            y2="11"
                            stroke={COLORS.gold}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    </svg>

                    <div>
                        <div
                            className="text-[15px] font-semibold tracking-tight"
                            style={{
                                color:
                                    COLORS.champagne,
                            }}
                        >
                            {LABELS.appTitle}
                        </div>

                        <div
                            className="text-[10px] tracking-[0.5px]"
                            style={{
                                color:
                                    COLORS.muted,
                            }}
                        >
                            {LABELS.appSubtitle}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <StatusBadge
                        state={systemState}
                    />

                    <div
                        className="flex items-center gap-1.5 rounded-lg px-3 py-[5px]"
                        style={{
                            background:
                                COLORS.latencyBg,
                            border: `0.5px solid ${COLORS.latencyBorder}`,
                        }}
                    >
                        <motion.div
                            animate={{
                                opacity: [
                                    1,
                                    0.3,
                                    1,
                                ],
                            }}
                            transition={{
                                repeat: Infinity,
                                duration:
                                    ANIMATION.latencyPulseSec,
                            }}
                            className="h-[5px] w-[5px] rounded-full"
                            style={{
                                background:
                                    COLORS.nominal,
                            }}
                        />

                        <span
                            className="font-mono text-[12px]"
                            style={{
                                color:
                                    COLORS.gold,
                            }}
                        >
                            {latencyMs}ms
                        </span>

                        <span
                            className="text-[11px]"
                            style={{
                                color:
                                    COLORS.muted,
                            }}
                        >
                            {LABELS.latencyUnit}
                        </span>
                    </div>
                </div>
            </header>

            <main
                className="relative z-[1] mx-auto grid gap-4 px-5 pb-10 pt-6"
                style={{
                    maxWidth:
                        LAYOUT.maxContentWidth,
                    gridTemplateColumns: `minmax(0, 1fr) ${LAYOUT.rightColWidth}px`,
                    gridTemplateRows:
                        "auto auto",
                }}
            >
                <Card
                    glow={isCritical}
                    className="col-start-1 row-start-1"
                >
                    <div className="flex items-start justify-between">
                        <CardLabel>
                            {LABELS.cardTemp}
                        </CardLabel>

                        <span
                            className="font-mono text-[10px] tracking-[1px]"
                            style={{
                                color:
                                    COLORS.muted,
                            }}
                        >
                            {LABELS.sensorPin}
                        </span>
                    </div>

                    <div className="mb-1 flex items-end gap-3">
                        <div
                            className="font-mono font-bold leading-none transition-colors duration-500"
                            style={{
                                fontSize: 88,
                                letterSpacing: -6,
                                color: tempColor,
                            }}
                        >
                            <AnimatedValue
                                value={
                                    temperature
                                }
                                decimals={1}
                            />
                        </div>

                        <div
                            className="pb-3.5 text-[28px] font-light"
                            style={{
                                color:
                                    COLORS.muted,
                            }}
                        >
                            °C
                        </div>
                    </div>

                    <div className="mb-2 flex items-center gap-2">
                        <span
                            className="font-mono text-[12px]"
                            style={{
                                color:
                                    deltaColor,
                            }}
                        >
                            {temperature >
                            THRESHOLDS.temp
                                .baseline
                                ? "▲"
                                : "▼"}{" "}
                            {Math.abs(
                                temperature -
                                    THRESHOLDS
                                        .temp
                                        .baseline
                            ).toFixed(1)}
                            °C from baseline
                        </span>

                        <span
                            className="text-[11px]"
                            style={{
                                color:
                                    COLORS.muted,
                            }}
                        >
                            ·{" "}
                            {THRESHOLDS.temp.baseline.toFixed(
                                1
                            )}
                            °C set point
                        </span>
                    </div>

                    <PersistenceBar
                        active={isWarning}
                        duration={
                            ANIMATION.persistDurationMs
                        }
                        label={
                            LABELS.persistLabel
                        }
                        trackColor={
                            COLORS.persistTrack
                        }
                        fillStartColor={
                            COLORS.goldDim
                        }
                        fillEndColor={
                            COLORS.gold
                        }
                        labelColor={
                            COLORS.gold
                        }
                    />

                    <div className="mt-5">
                        <CardLabel>
                            {LABELS.cardHistory}
                        </CardLabel>

                        <HeatGrid
                            dataHistory={
                                tempHistory
                            }
                        />
                    </div>
                </Card>

                <div className="col-start-2 row-start-1 row-end-3 flex flex-col gap-4">
                    <Card>
                        <CardLabel>
                            {LABELS.cardHumidity}
                        </CardLabel>

                        <div className="flex items-end gap-1.5">
                            <span
                                className="font-mono font-bold leading-none transition-colors duration-500"
                                style={{
                                    fontSize: 56,
                                    letterSpacing: -3,
                                    color:
                                        humidityColor,
                                }}
                            >
                                <AnimatedValue
                                    value={
                                        humidity
                                    }
                                    decimals={0}
                                />
                            </span>

                            <span
                                className="pb-2 text-[22px]"
                                style={{
                                    color:
                                        COLORS.muted,
                                }}
                            >
                                %
                            </span>
                        </div>

                        <div
                            className="mt-3 h-1 overflow-hidden rounded-full"
                            style={{
                                background:
                                    COLORS.humTrack,
                            }}
                        >
                            <motion.div
                                animate={{
                                    width: `${Math.min(
                                        Math.max(
                                            humidity,
                                            0
                                        ),
                                        100
                                    )}%`,
                                }}
                                transition={{
                                    duration: 1,
                                    ease: "easeOut",
                                }}
                                className="h-full rounded-full"
                                style={{
                                    background:
                                        humidityBarColor,
                                }}
                            />
                        </div>

                        <div
                            className="mt-1.5 flex justify-between font-mono text-[10px]"
                            style={{
                                color:
                                    COLORS.muted,
                            }}
                        >
                            <span>
                                {LABELS.humDry}
                            </span>
                            <span>
                                {LABELS.humIdeal}
                            </span>
                            <span>
                                {LABELS.humWet}
                            </span>
                        </div>
                    </Card>

                    <Card>
                        <CardLabel>
                            {LABELS.cardSram}
                        </CardLabel>

                        <SramGauge
                            bytes={freeRam}
                        />
                    </Card>
                </div>

                <Card className="col-start-1 row-start-2">
                    <div className="mb-1.5 flex items-center justify-between">
                        <CardLabel>
                            {LABELS.cardTrend}
                        </CardLabel>

                        <div
                            className="flex gap-4 font-mono text-[11px]"
                            style={{
                                color:
                                    COLORS.muted,
                            }}
                        >
                            <span>
                                MIN{" "}
                                <span
                                    style={{
                                        color:
                                            COLORS.champagne,
                                    }}
                                >
                                    {tempMin}°
                                </span>
                            </span>

                            <span>
                                MAX{" "}
                                <span
                                    style={{
                                        color:
                                            COLORS.champagne,
                                    }}
                                >
                                    {tempMax}°
                                </span>
                            </span>

                            <span>
                                AVG{" "}
                                <span
                                    style={{
                                        color:
                                            COLORS.gold,
                                    }}
                                >
                                    {tempAvg}°
                                </span>
                            </span>
                        </div>
                    </div>

                    <RechartsSparkline
                        data={tempHistory}
                    />
                </Card>
            </main>

            <footer
                className="relative z-[1] flex justify-between px-7 py-3 font-mono text-[10px] tracking-[1px]"
                style={{
                    borderTop: `0.5px solid ${COLORS.footerBorder}`,
                    color: COLORS.muted,
                }}
            >
                <span>
                    {LABELS.footerCopy}
                </span>

                <span>
                    {new Date().toLocaleTimeString()}{" "}
                    · {LABELS.liveFeed}
                </span>
            </footer>
        </div>
    );
}