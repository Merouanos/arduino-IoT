import { motion } from "framer-motion";

import type { Alert } from "../../types/alert";

import {
    COLORS,
    getAlertColor,
} from "./Constant";

import AlertBadge from "./AlertBadge";

interface AlertCardProps {
    alert: Alert;
    onResolve?: (alertId: string) => void;
    resolving?: boolean;
}

export default function AlertCard({
    alert,
    onResolve,
    resolving = false,
}: AlertCardProps) {
    const color =
        getAlertColor(alert.severity);

    const resolved =
        alert.resolved_at !== null;

    return (
        <motion.div
            layout
            initial={{
                opacity: 0,
                y: 6,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            className="rounded-xl border p-4"
            style={{
                background: resolved
                    ? COLORS.resolvedBg
                    : alert.severity ===
                        "critical"
                      ? COLORS.criticalBg
                      : COLORS.warningBg,

                borderColor: resolved
                    ? `${COLORS.nominal}22`
                    : `${color}22`,
            }}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <span
                            className="font-mono text-[9px] uppercase tracking-[2px]"
                            style={{
                                color:
                                    COLORS.muted,
                            }}
                        >
                            {alert.type}
                        </span>

                        <AlertBadge
                            severity={
                                alert.severity
                            }
                        />
                    </div>

                    <p
                        className="mt-2 text-sm"
                        style={{
                            color:
                                COLORS.champagne,
                        }}
                    >
                        {alert.message}
                    </p>
                </div>

                <span
                    className="shrink-0 font-mono text-[9px]"
                    style={{
                        color:
                            COLORS.muted,
                    }}
                >
                    {resolved
                        ? "RESOLVED"
                        : "ACTIVE"}
                </span>
            </div>

            <div
                className="mt-3 flex flex-col gap-3 border-t pt-3 font-mono text-[9px] sm:flex-row sm:items-center sm:justify-between"
                style={{
                    borderColor:
                        "rgba(255,255,255,0.06)",
                    color:
                        COLORS.muted,
                }}
            >
                <span>
                    STARTED{" "}
                    {new Date(
                        alert.started_at
                    ).toLocaleString()}

                    {alert.resolved_at && (
                        <>
                            {" · RESOLVED "}
                            {new Date(
                                alert.resolved_at
                            ).toLocaleString()}
                        </>
                    )}
                </span>

                {!resolved && onResolve && (
                    <button
                        type="button"
                        onClick={() => onResolve(alert.id)}
                        disabled={resolving}
                        className="self-start rounded-lg border px-3 py-2 font-mono text-[9px] tracking-[1px] transition-colors hover:bg-white/[0.05] disabled:opacity-50 sm:self-auto"
                        style={{
                            color: COLORS.champagne,
                            borderColor: `${color}55`,
                        }}
                    >
                        {resolving ? "RESOLVING..." : "MARK RESOLVED"}
                    </button>
                )}
            </div>
        </motion.div>
    );
}