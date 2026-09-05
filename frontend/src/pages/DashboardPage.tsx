import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useDevices } from "../context/DeviceContext";

import {
    getLatestReading,
    getReadingHistory,
} from "../api/reading.api";

import {
    getDeviceAlerts,
    resolveAlert,
} from "../api/alert.api";

import AlertList from "../components/alerts/AlertList";
import ReadingHistoryPanel from "../components/readings/ReadingHistoryPanel";

import Climat from "../components/dashboard/Climat";
import SimulatorControl from "../components/dashboard/SimulatorControl";

import {
    toDashboardReading,
    toTemperatureHistory,
    upsertAlert,
} from "../utils/dashboard-adapter";

import {
    useDeviceSocket,
} from "../hooks/useDeviceSocket";

import type { Reading } from "../types/reading";
import type { Alert } from "../types/alert";

export default function DashboardPage() {
    const {
        selectedDevice,
        devices,
        isLoading: devicesLoading,
    } = useDevices();

    const [
        latestReading,
        setLatestReading,
    ] = useState<Reading | null>(null);

    const [
        readingHistory,
        setReadingHistory,
    ] = useState<Reading[]>([]);

    const [
        alerts,
        setAlerts,
    ] = useState<Alert[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState<string | null>(null);

    const [socketStatus, setSocketStatus] =
        useState<
            "connecting" | "connected" | "disconnected" | "error"
        >("disconnected");

    const [resolvingAlertId, setResolvingAlertId] =
        useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<
        "overview" | "readings" | "alerts"
    >("overview");

    useEffect(() => {
        if (!selectedDevice) {
            setLatestReading(null);
            setReadingHistory([]);
            setAlerts([]);
            setError(null);
            setLoading(false);

            return;
        }

        const deviceId = selectedDevice.id;
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const [
                    latestResult,
                    historyResult,
                    alertsResult,
                ] = await Promise.all([
                    getLatestReading(
                        deviceId
                    ),
                    getReadingHistory(
                        deviceId
                    ),
                    getDeviceAlerts(
                        deviceId
                    ),
                ]);

                if (cancelled) {
                    return;
                }

                setLatestReading(
                    latestResult.reading
                );

                setReadingHistory(
                    historyResult.readings
                );

                setAlerts(
                    alertsResult.alerts
                );
            } catch {
                if (cancelled) {
                    return;
                }

                setError(
                    "Failed to load sensor data"
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, [selectedDevice]);

    const handleReading =
        useCallback(
            (reading: Reading) => {
                setLatestReading(
                    reading
                );

                setReadingHistory(
                    (previous) => {
                        const existingIndex =
                            previous.findIndex(
                                (item) =>
                                    item.id ===
                                    reading.id
                            );

                        if (
                            existingIndex ===
                            -1
                        ) {
                            return [
                                ...previous,
                                reading,
                            ].slice(-100);
                        }

                        const next = [
                            ...previous,
                        ];
                        next[existingIndex] =
                            reading;
                        return next;
                    }
                );
            },
            []
        );

    const handleAlert =
        useCallback(
            (alert: Alert) => {
                setAlerts(
                    (previous) =>
                        upsertAlert(
                            previous,
                            alert
                        )
                );
            },
            []
        );

    const handleResolveAlert = useCallback(
        async (alertId: string) => {
            try {
                setResolvingAlertId(alertId);
                const result = await resolveAlert(alertId);
                setAlerts((previous) =>
                    upsertAlert(previous, result.alert)
                );
            } catch {
                setError("Failed to resolve alert");
            } finally {
                setResolvingAlertId(null);
            }
        },
        []
    );

    useDeviceSocket({
        deviceId:
            selectedDevice?.id ?? null,

        onStatusChange: setSocketStatus,

        onReading:
            handleReading,

        onAlert:
            handleAlert,
    });

    const dashboardReading =
        useMemo(() => {
            if (!latestReading) {
                return null;
            }

            return toDashboardReading(
                latestReading
            );
        }, [latestReading]);

    const temperatureHistory =
        useMemo(
            () =>
                toTemperatureHistory(
                    readingHistory
                ),
            [readingHistory]
        );

    if (
        devicesLoading ||
        loading
    ) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black text-white">
                <p className="font-mono text-xs tracking-[2px] text-zinc-500">
                    LOADING SYSTEM...
                </p>
            </main>
        );
    }

    if (devices.length === 0) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black text-white">
                <div className="text-center">
                    <p className="font-mono text-xs tracking-[2px] text-zinc-400">
                        NO DEVICES FOUND
                    </p>

                    <p className="mt-2 text-sm text-zinc-600">
                        Add a device from the
                        Devices page.
                    </p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black text-red-400">
                {error}
            </main>
        );
    }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between px-5 pt-5">
            <span className="font-mono text-[10px] tracking-[1.5px] text-zinc-500">
                REALTIME LINK
            </span>
            <span
                className="flex items-center gap-2 font-mono text-[10px] tracking-[1px]"
                style={{
                    color: socketStatus === "connected"
                        ? "#6EE7A2"
                        : socketStatus === "error"
                          ? "#FF5C5C"
                          : "#F5C451",
                }}
            >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {socketStatus.toUpperCase()}
            </span>
        </div>

        {selectedDevice && (
            <SimulatorControl
                deviceId={selectedDevice.id}
            />
        )}

        <div className="px-5 pt-1">
            <div
                className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto rounded-xl border p-1"
                role="tablist"
                aria-label="Device views"
                style={{
                    background: "rgba(255,255,255,0.025)",
                    borderColor: "rgba(255,255,255,0.08)",
                }}
            >
                {([
                    ["overview", "OVERVIEW"],
                    ["readings", "READINGS & HISTORY"],
                    ["alerts", "ALERTS"],
                ] as const).map(([tab, label]) => (
                    <button
                        key={tab}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab}
                        onClick={() => setActiveTab(tab)}
                        className="min-w-max flex-1 rounded-lg px-4 py-3 font-mono text-[10px] tracking-[1px] transition-colors"
                        style={{
                            color: activeTab === tab ? "#F3E7C5" : "#8A877E",
                            background: activeTab === tab
                                ? "rgba(212,175,55,0.14)"
                                : "transparent",
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>

        {activeTab === "overview" && (
            <>
                {dashboardReading ? (
                    <Climat
                        data={dashboardReading}
                        temperatureHistory={
                            temperatureHistory
                        }
                    />
                ) : (
                    <div className="mx-5 rounded-2xl border p-8 text-center" style={{ borderColor: "rgba(255,255,255,0.08)", color: "#8A877E" }}>
                        <p className="font-mono text-xs tracking-[1.5px]">
                            WAITING FOR SENSOR DATA...
                        </p>
                        <p className="mt-2 text-sm">
                            Readings and alerts will appear here when this device reports.
                        </p>
                    </div>
                )}
            </>
        )}

        {activeTab === "readings" && (
            <div className="px-5 pb-10">
                <div className="mx-auto max-w-[1400px]">
                    <ReadingHistoryPanel
                        latestReading={latestReading}
                        readings={readingHistory}
                    />
                </div>
            </div>
        )}

        {activeTab === "alerts" && (
            <div className="px-5 pb-10">
                <div className="mx-auto max-w-[1400px]">
                    <AlertList
                        alerts={alerts}
                        onResolve={handleResolveAlert}
                        resolvingAlertId={resolvingAlertId}
                    />
                </div>
            </div>
        )}

        {activeTab === "overview" && (
        <div className="px-5 pb-10">
            <div className="mx-auto max-w-[1400px]">
                <div className="rounded-xl border p-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="font-mono text-[10px] tracking-[1.5px] text-zinc-500">
                            DEVICE DATA
                        </span>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setActiveTab("readings")} className="rounded-lg border border-white/10 px-3 py-2 font-mono text-[9px] text-zinc-400 hover:text-yellow-300">
                                VIEW HISTORY
                            </button>
                            <button type="button" onClick={() => setActiveTab("alerts")} className="rounded-lg border border-white/10 px-3 py-2 font-mono text-[9px] text-zinc-400 hover:text-yellow-300">
                                VIEW ALERTS
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        )}
    </div>
);

    
}