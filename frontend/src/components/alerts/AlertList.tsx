import type { Alert } from "../../types/alert";
import { useMemo, useState } from "react";

import { COLORS } from "./Constant";
import AlertCard from "./AlertCard";

interface AlertListProps {
    alerts: Alert[];
    onResolve?: (alertId: string) => void;
    resolvingAlertId?: string | null;
}

export default function AlertList({
    alerts,
    onResolve,
    resolvingAlertId = null,
}: AlertListProps) {
    const [filter, setFilter] = useState<"all" | "active">("all");
    const visibleAlerts = useMemo(
        () =>
            filter === "active"
                ? alerts.filter((alert) => alert.resolved_at === null)
                : alerts,
        [alerts, filter]
    );

    return (
        <section>
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <p
                        className="font-mono text-[10px] tracking-[2.5px]"
                        style={{
                            color:
                                COLORS.gold,
                        }}
                    >
                        ALERTS
                    </p>

                    <p
                        className="mt-1 text-xs"
                        style={{
                            color:
                                COLORS.muted,
                        }}
                    >
                        SENSOR EVENT HISTORY
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {(["all", "active"] as const).map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setFilter(value)}
                            className="rounded-md px-2 py-1 font-mono text-[9px] tracking-[1px]"
                            style={{
                                color: filter === value ? COLORS.champagne : COLORS.muted,
                                background: filter === value ? "rgba(212,175,55,0.12)" : "transparent",
                            }}
                        >
                            {value.toUpperCase()}
                        </button>
                    ))}
                    <span className="font-mono text-[10px]" style={{ color: COLORS.muted }}>
                        {visibleAlerts.length} EVENTS
                    </span>
                </div>
            </div>

            {visibleAlerts.length === 0 ? (
                <div
                    className="rounded-xl border p-6 text-center"
                    style={{
                        background:
                            COLORS.cardBg,
                        borderColor:
                            COLORS.cardBorder,
                    }}
                >
                    <span
                        className="font-mono text-[10px] tracking-[1.5px]"
                        style={{
                            color:
                                COLORS.nominal,
                        }}
                    >
                        NO ALERTS
                    </span>
                </div>
            ) : (
                <div className="space-y-3">
                    {visibleAlerts.map(
                        (alert) => (
                            <AlertCard
                                key={
                                    alert.id
                                }
                                alert={
                                    alert
                                }
                                onResolve={onResolve}
                                resolving={
                                    resolvingAlertId === alert.id
                                }
                            />
                        )
                    )}
                </div>
            )}
        </section>
    );
}