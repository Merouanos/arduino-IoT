import { useCallback, useEffect, useState } from "react";

import { getLatestReading, getReadingHistory } from "../api/reading.api";
import { useDevices } from "../context/DeviceContext";
import ReadingHistoryPanel from "../components/readings/ReadingHistoryPanel";
import { useDeviceSocket } from "../hooks/useDeviceSocket";
import type { Reading } from "../types/reading";
import { COLORS } from "../components/devices/Constant";

export default function ReadingsPage() {
    const { selectedDevice, isLoading: devicesLoading } = useDevices();
    const [latestReading, setLatestReading] = useState<Reading | null>(null);
    const [readings, setReadings] = useState<Reading[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedDevice) {
            setLatestReading(null);
            setReadings([]);
            setLoading(false);
            return;
        }

        const deviceId = selectedDevice.id;
        let cancelled = false;

        async function loadReadings() {
            try {
                setLoading(true);
                setError(null);
                const [latestResult, historyResult] = await Promise.all([
                    getLatestReading(deviceId),
                    getReadingHistory(deviceId),
                ]);

                if (cancelled) {
                    return;
                }

                setLatestReading(latestResult.reading);
                setReadings(historyResult.readings);
            } catch {
                if (!cancelled) {
                    setError("Failed to load reading history");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadReadings();

        return () => {
            cancelled = true;
        };
    }, [selectedDevice]);

    const handleReading = useCallback((reading: Reading) => {
        setLatestReading(reading);
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

    useDeviceSocket({
        deviceId: selectedDevice?.id ?? null,
        onReading: handleReading,
    });

    if (devicesLoading || loading) {
        return <PageState label="LOADING READINGS..." />;
    }

    if (!selectedDevice) {
        return <PageState label="SELECT A DEVICE TO VIEW READINGS" />;
    }

    if (error) {
        return <PageState label={error} error />;
    }

    return (
        <main className="min-h-screen px-5 pb-12 pt-6" style={{ background: COLORS.background, color: COLORS.champagne }}>
            <div className="mx-auto max-w-[1400px]">
                <header className="mb-8">
                    <p className="font-mono text-[10px] tracking-[2.5px]" style={{ color: COLORS.gold }}>
                        READINGS
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold">READING HISTORY</h1>
                    <p className="mt-2 text-sm" style={{ color: COLORS.muted }}>
                        Latest measurements and historical sensor records for {selectedDevice.name}.
                    </p>
                </header>
                <ReadingHistoryPanel latestReading={latestReading} readings={readings} />
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
