import { useCallback, useEffect, useState } from "react";

import { getDeviceAlerts, resolveAlert } from "../api/alert.api";
import { getReadingHistory } from "../api/reading.api";
import AlertList from "../components/alerts/AlertList";
import SensorActivityPanel from "../components/dashboard/SensorActivityPanel";
import { COLORS } from "../components/devices/Constant";
import { useDevices } from "../context/DeviceContext";
import { useDeviceSocket } from "../hooks/useDeviceSocket";
import type { Alert } from "../types/alert";
import type { Reading } from "../types/reading";
import { upsertAlert } from "../utils/dashboard-adapter";

export default function ActivityPage() {
    const { selectedDevice, isLoading: devicesLoading } = useDevices();
    const [readings, setReadings] = useState<Reading[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedDevice) {
            setReadings([]);
            setAlerts([]);
            setLoading(false);
            return;
        }

        const deviceId = selectedDevice.id;
        let cancelled = false;

        async function loadActivity() {
            try {
                setLoading(true);
                setError(null);
                const [historyResult, alertsResult] = await Promise.all([
                    getReadingHistory(deviceId),
                    getDeviceAlerts(deviceId),
                ]);

                if (cancelled) {
                    return;
                }

                setReadings(historyResult.readings);
                setAlerts(alertsResult.alerts);
            } catch {
                if (!cancelled) {
                    setError("FAILED TO LOAD DEVICE ACTIVITY");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadActivity();
        return () => {
            cancelled = true;
        };
    }, [selectedDevice]);

    const handleReading = useCallback((reading: Reading) => {
        setReadings((previous) => {
            const existingIndex = previous.findIndex((item) => item.id === reading.id);
            if (existingIndex === -1) {
                return [...previous, reading].slice(-100);
            }

            const next = [...previous];
            next[existingIndex] = reading;
            return next;
        });
    }, []);

    const handleAlert = useCallback((alert: Alert) => {
        setAlerts((previous) => upsertAlert(previous, alert));
    }, []);

    const handleResolveAlert = useCallback(async (alertId: string) => {
        try {
            setResolvingAlertId(alertId);
            const result = await resolveAlert(alertId);
            setAlerts((previous) => upsertAlert(previous, result.alert));
        } catch {
            setError("FAILED TO RESOLVE ALERT");
        } finally {
            setResolvingAlertId(null);
        }
    }, []);

    useDeviceSocket({
        deviceId: selectedDevice?.id ?? null,
        onReading: handleReading,
        onAlert: handleAlert,
    });

    if (devicesLoading || loading) {
        return <PageState label="LOADING DEVICE ACTIVITY..." />;
    }

    if (!selectedDevice) {
        return <PageState label="SELECT A DEVICE TO VIEW ACTIVITY" />;
    }

    if (error) {
        return <PageState label={error} error />;
    }

    return (
        <main
            className="min-h-screen px-5 pb-12 pt-6"
            style={{ background: COLORS.background, color: COLORS.champagne }}
        >
            <div className="mx-auto max-w-[1400px]">
                <header className="mb-8">
                    <p className="font-mono text-[10px] tracking-[2.5px]" style={{ color: COLORS.gold }}>
                        ACTIVITY CENTER
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold">DEVICE HISTORY</h1>
                    <p className="mt-2 text-sm" style={{ color: COLORS.muted }}>
                        Understand trends, investigate incidents, and close the loop for {selectedDevice.name}.
                    </p>
                </header>

                <SensorActivityPanel readings={readings} alerts={alerts} />

                <section className="mt-8">
                    <AlertList
                        alerts={alerts}
                        onResolve={handleResolveAlert}
                        resolvingAlertId={resolvingAlertId}
                    />
                </section>
            </div>
        </main>
    );
}

function PageState({ label, error = false }: { label: string; error?: boolean }) {
    return (
        <main
            className="flex min-h-screen items-center justify-center px-5"
            style={{
                background: COLORS.background,
                color: error ? COLORS.critical : COLORS.muted,
            }}
        >
            <p className="font-mono text-xs tracking-[1.5px]">{label}</p>
        </main>
    );
}
