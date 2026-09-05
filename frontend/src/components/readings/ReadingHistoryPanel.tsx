import type { Reading } from "../../types/reading";
import { COLORS } from "../devices/Constant";

interface ReadingHistoryPanelProps {
    latestReading: Reading | null;
    readings: Reading[];
}

export default function ReadingHistoryPanel({
    latestReading,
    readings,
}: ReadingHistoryPanelProps) {
    const orderedReadings = [...readings].reverse();

    return (
        <section
            className="rounded-2xl border p-5 sm:p-6"
            style={{
                background: COLORS.cardBg,
                borderColor: COLORS.cardBorder,
            }}
        >
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p
                        className="font-mono text-[10px] tracking-[2px]"
                        style={{ color: COLORS.gold }}
                    >
                        SENSOR READINGS
                    </p>
                    <p
                        className="mt-1 text-xs"
                        style={{ color: COLORS.muted }}
                    >
                        LATEST VALUE AND RECENT HISTORY
                    </p>
                </div>
                <span
                    className="font-mono text-[10px]"
                    style={{ color: COLORS.muted }}
                >
                    {readings.length} RECORDS
                </span>
            </div>

            {latestReading ? (
                <div className="mb-5 grid gap-3 sm:grid-cols-4">
                    <ReadingMetric
                        label="TEMPERATURE"
                        value={`${latestReading.temperature.toFixed(1)}°C`}
                    />
                    <ReadingMetric
                        label="HUMIDITY"
                        value={`${latestReading.humidity.toFixed(1)}%`}
                    />
                    <ReadingMetric
                        label="FREE RAM"
                        value={`${latestReading.free_ram} B`}
                    />
                    <ReadingMetric
                        label="RECORDED"
                        value={new Date(latestReading.recorded_at).toLocaleTimeString()}
                    />
                </div>
            ) : (
                <div
                    className="mb-5 rounded-xl border p-5 text-center font-mono text-[10px] tracking-[1px]"
                    style={{
                        color: COLORS.muted,
                        borderColor: COLORS.cardBorder,
                    }}
                >
                    WAITING FOR THE FIRST SENSOR READING
                </div>
            )}

            {orderedReadings.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border" style={{ borderColor: COLORS.cardBorder }}>
                    <table className="w-full min-w-[560px] text-left">
                        <thead>
                            <tr style={{ background: "rgba(255,255,255,0.025)" }}>
                                <TableHeading>RECORDED</TableHeading>
                                <TableHeading>TEMPERATURE</TableHeading>
                                <TableHeading>HUMIDITY</TableHeading>
                                <TableHeading>RAM</TableHeading>
                                <TableHeading>STATUS</TableHeading>
                            </tr>
                        </thead>
                        <tbody>
                            {orderedReadings.map((reading) => (
                                <tr key={reading.id} className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                                    <TableCell>{new Date(reading.recorded_at).toLocaleString()}</TableCell>
                                    <TableCell>{reading.temperature.toFixed(1)}°C</TableCell>
                                    <TableCell>{reading.humidity.toFixed(1)}%</TableCell>
                                    <TableCell>{reading.free_ram} B</TableCell>
                                    <TableCell>
                                        T:{reading.temperature_status} / H:{reading.humidity_status}
                                    </TableCell>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="font-mono text-[10px]" style={{ color: COLORS.subtle }}>
                    HISTORY WILL APPEAR AFTER THE DEVICE REPORTS.
                </p>
            )}
        </section>
    );
}

function ReadingMetric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border p-4" style={{ borderColor: COLORS.cardBorder }}>
            <p className="font-mono text-[9px] tracking-[1.2px]" style={{ color: COLORS.muted }}>
                {label}
            </p>
            <p className="mt-2 text-lg" style={{ color: COLORS.champagne }}>
                {value}
            </p>
        </div>
    );
}

function TableHeading({ children }: { children: React.ReactNode }) {
    return (
        <th className="px-4 py-3 font-mono text-[9px] font-normal tracking-[1px]" style={{ color: COLORS.muted }}>
            {children}
        </th>
    );
}

function TableCell({ children }: { children: React.ReactNode }) {
    return (
        <td className="px-4 py-3 font-mono text-[10px]" style={{ color: COLORS.champagne }}>
            {children}
        </td>
    );
}
