import { useEffect, useState } from "react";

import {
    getSimulatorStatus,
    setSimulatorSuspended,
} from "../../api/simulator.api";
import { COLORS } from "./Constant";

interface SimulatorControlProps {
    deviceId: string;
}

export default function SimulatorControl({ deviceId }: SimulatorControlProps) {
    const [suspended, setSuspended] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadStatus() {
            try {
                setLoading(true);
                setError(null);
                const result = await getSimulatorStatus(deviceId);
                if (!cancelled) {
                    setSuspended(result.suspended);
                }
            } catch {
                if (!cancelled) {
                    setError("SIMULATOR CONTROL UNAVAILABLE");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadStatus();
        return () => {
            cancelled = true;
        };
    }, [deviceId]);

    async function toggleSimulator() {
        try {
            setSaving(true);
            setError(null);
            const result = await setSimulatorSuspended(deviceId, !suspended);
            setSuspended(result.suspended);
        } catch {
            setError("FAILED TO UPDATE SIMULATOR");
        } finally {
            setSaving(false);
        }
    }

    return (
        <section
            className="mx-5 flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
            style={{
                background: suspended ? "rgba(245,196,81,0.06)" : COLORS.cardBg,
                borderColor: suspended ? `${COLORS.warning}44` : COLORS.cardBorder,
            }}
        >
            <div className="flex items-start gap-3">
                <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{
                        background: suspended ? COLORS.warning : COLORS.nominal,
                        boxShadow: `0 0 8px ${suspended ? COLORS.warning : COLORS.nominal}`,
                    }}
                />
                <div>
                    <p className="font-mono text-[10px] tracking-[1.8px]" style={{ color: COLORS.gold }}>
                        SIMULATOR CONTROL
                    </p>
                    <p className="mt-1 text-sm" style={{ color: COLORS.champagne }}>
                        {loading
                            ? "CHECKING STATUS..."
                            : suspended
                              ? "SUSPENDED · NO READINGS WILL BE SENT"
                              : "ACTIVE · SENDING SENSOR READINGS"}
                    </p>
                    {error && (
                        <p className="mt-1 font-mono text-[9px]" style={{ color: COLORS.critical }}>
                            {error}
                        </p>
                    )}
                </div>
            </div>

            <button
                type="button"
                onClick={() => void toggleSimulator()}
                disabled={loading || saving || !!error}
                className="rounded-xl px-4 py-3 font-mono text-[10px] font-semibold tracking-[1.2px] transition-opacity disabled:opacity-40"
                style={{
                    color: COLORS.background,
                    background: suspended ? COLORS.nominal : COLORS.warning,
                }}
            >
                {saving
                    ? "UPDATING..."
                    : suspended
                      ? "ACTIVATE SIMULATOR"
                      : "SUSPEND SIMULATOR"}
            </button>
        </section>
    );
}
