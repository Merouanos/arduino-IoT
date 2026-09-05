import {
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type { Alert } from "../../types/alert";
import type { Reading } from "../../types/reading";
import { COLORS } from "./Constant";

interface SensorActivityPanelProps {
    readings: Reading[];
    alerts: Alert[];
}

export default function SensorActivityPanel({
    readings,
    alerts,
}: SensorActivityPanelProps) {
    const chartData = readings.slice(-48).map((reading) => ({
        time: new Date(reading.recorded_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        }),
        temperature: Number(reading.temperature.toFixed(1)),
        humidity: Number(reading.humidity.toFixed(1)),
    }));

    const recentAlerts = [...alerts]
        .sort(
            (first, second) =>
                new Date(second.started_at).getTime() -
                new Date(first.started_at).getTime()
        )
        .slice(0, 5);

    return (
        <section
            className="mx-5 rounded-2xl border p-5 sm:p-6"
            style={{
                background: COLORS.cardBg,
                borderColor: COLORS.cardBorder,
            }}
        >
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="font-mono text-[10px] tracking-[2px]" style={{ color: COLORS.gold }}>
                        SENSOR ACTIVITY
                    </p>
                    <p className="mt-1 text-xs" style={{ color: COLORS.muted }}>
                        RECENT READINGS AND ALERT LIFECYCLE
                    </p>
                </div>
                <span className="font-mono text-[10px]" style={{ color: COLORS.muted }}>
                    {readings.length} READINGS · {alerts.length} ALERTS
                </span>
            </div>

            {chartData.length > 0 ? (
                <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
                            <XAxis dataKey="time" hide />
                            <YAxis yAxisId="temperature" hide domain={["auto", "auto"]} />
                            <YAxis yAxisId="humidity" hide domain={["auto", "auto"]} />
                            <Tooltip
                                contentStyle={{
                                    background: "#0b0b0b",
                                    border: `1px solid ${COLORS.cardBorder}`,
                                    borderRadius: "10px",
                                    color: COLORS.champagne,
                                    fontSize: "11px",
                                }}
                            />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                iconType="line"
                                wrapperStyle={{
                                    color: COLORS.muted,
                                    fontSize: "10px",
                                    paddingBottom: "12px",
                                }}
                            />
                            <Line
                                yAxisId="temperature"
                                type="monotone"
                                dataKey="temperature"
                                name="Temperature °C"
                                stroke={COLORS.gold}
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                yAxisId="humidity"
                                type="monotone"
                                dataKey="humidity"
                                name="Humidity %"
                                stroke={COLORS.humidityLow}
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="flex h-[180px] items-center justify-center rounded-xl border font-mono text-[10px] tracking-[1px]" style={{ borderColor: COLORS.cardBorder, color: COLORS.muted }}>
                    SENSOR HISTORY WILL APPEAR HERE
                </div>
            )}

            <div className="mt-6 border-t pt-5" style={{ borderColor: COLORS.cardBorder }}>
                <div className="mb-3 flex items-center justify-between">
                    <p className="font-mono text-[10px] tracking-[1.5px]" style={{ color: COLORS.muted }}>
                        ALERT LIFECYCLE
                    </p>
                    <span className="font-mono text-[9px]" style={{ color: COLORS.muted }}>
                        LAST 5 EVENTS
                    </span>
                </div>

                {recentAlerts.length > 0 ? (
                    <div className="space-y-2">
                        {recentAlerts.map((alert) => {
                            const resolved = alert.resolved_at !== null;
                            const color = alert.severity === "critical" ? COLORS.critical : COLORS.warning;

                            return (
                                <div key={alert.id} className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: `${color}33` }}>
                                    <div className="flex items-center gap-3">
                                        <span className="h-2 w-2 rounded-full" style={{ background: resolved ? COLORS.nominal : color }} />
                                        <div>
                                            <p className="font-mono text-[10px] uppercase tracking-[1px]" style={{ color }}>
                                                {alert.type} · {alert.severity}
                                            </p>
                                            <p className="mt-1 text-xs" style={{ color: COLORS.champagne }}>
                                                {alert.message}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="font-mono text-[9px] sm:text-right" style={{ color: COLORS.muted }}>
                                        <div>STARTED {new Date(alert.started_at).toLocaleString()}</div>
                                        <div style={{ color: resolved ? COLORS.nominal : COLORS.warning }}>
                                            {resolved
                                                ? `RESOLVED ${new Date(alert.resolved_at as string).toLocaleString()}`
                                                : "ACTIVE · NEEDS ATTENTION"}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="font-mono text-[10px]" style={{ color: COLORS.nominal }}>
                        NO ALERT ACTIVITY FOR THIS DEVICE
                    </p>
                )}
            </div>
        </section>
    );
}
