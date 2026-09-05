import { useCallback, useEffect, useState } from "react";

import { getDeviceAlerts, resolveAlert } from "../api/alert.api";
import AlertList from "../components/alerts/AlertList";
import { COLORS } from "../components/devices/Constant";
import { useDevices } from "../context/DeviceContext";
import { useDeviceSocket } from "../hooks/useDeviceSocket";
import type { Alert } from "../types/alert";
import { upsertAlert } from "../utils/dashboard-adapter";

export default function AlertsPage() {
    const { selectedDevice, isLoading: devicesLoading } = useDevices();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedDevice) {
            setAlerts([]);
            setLoading(false);
            return;
        }

        const deviceId = selectedDevice.id;
        let cancelled = false;

        async function loadAlerts() {
            try {
                setLoading(true);
                setError(null);
                const result = await getDeviceAlerts(deviceId);

                if (!cancelled) {
                    setAlerts(result.alerts);
                }
            } catch {
                if (!cancelled) {
                    setError("Failed to load alerts");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadAlerts();

        return () => {
            cancelled = true;
        };
    }, [selectedDevice]);

    const handleAlert = useCallback((alert: Alert) => {
        setAlerts((previous) => upsertAlert(previous, alert));
    }, []);

    const handleResolveAlert = useCallback(async (alertId: string) => {
        try {
            setResolvingAlertId(alertId);
            const result = await resolveAlert(alertId);
            setAlerts((previous) => upsertAlert(previous, result.alert));
        } catch {
            setError("Failed to resolve alert");
        } finally {
            setResolvingAlertId(null);
        }
    }, []);

    useDeviceSocket({
        deviceId: selectedDevice?.id ?? null,
        onAlert: handleAlert,
    });

    if (devicesLoading || loading) {
        return <PageState label="LOADING ALERTS..." />;
    }

    if (!selectedDevice) {
        return <PageState label="SELECT A DEVICE TO VIEW ALERTS" />;
    }

    if (error) {
        return <PageState label={error} error />;
    }

    return (
        <main className="min-h-screen px-5 pb-12 pt-6" style={{ background: COLORS.background, color: COLORS.champagne }}>
            <div className="mx-auto max-w-[1400px]">
                <header className="mb-8">
                    <p className="font-mono text-[10px] tracking-[2.5px]" style={{ color: COLORS.gold }}>
                        ALERTS
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold">ALERT CENTER</h1>
                    <p className="mt-2 text-sm" style={{ color: COLORS.muted }}>
                        Review and resolve sensor events for {selectedDevice.name}.
                    </p>
                </header>
                <AlertList
                    alerts={alerts}
                    onResolve={handleResolveAlert}
                    resolvingAlertId={resolvingAlertId}
                />
            </div>
        </main>
    );
}

function PageState({ label, error = false }: { label: string; error?: boolean }) {
    return (
        <main className="flex min-h-screen items-center justify-center px-5" style={{ background: COLORS.background, color: error ? COLORS.critical : COLORS.muted }}>
            <p className="font-mono text-xs tracking-[1.5px]">{label}</p>
        </main>
    );
}
