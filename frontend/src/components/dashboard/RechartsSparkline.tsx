import {
    Area,
    AreaChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts";

import { COLORS } from "./Constant";

interface RechartsSparklineProps {
    data: number[];
}

export default function RechartsSparkline({
    data,
}: RechartsSparklineProps) {
    const formattedData = data.map(
        (value, index) => ({
            index,
            temperature: value,
        })
    );

    return (
        <ResponsiveContainer
            width="100%"
            height={200}
        >
            <AreaChart
                data={formattedData}
                margin={{
                    top: 8,
                    right: 4,
                    bottom: 0,
                    left: -20,
                }}
            >
                <XAxis
                    dataKey="index"
                    hide
                />

                <YAxis
                    hide
                    domain={["auto", "auto"]}
                />

                <defs>
                    <linearGradient
                        id="temperatureGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor={
                                COLORS.gold
                            }
                            stopOpacity={0.25}
                        />

                        <stop
                            offset="100%"
                            stopColor={
                                COLORS.gold
                            }
                            stopOpacity={0}
                        />
                    </linearGradient>
                </defs>

                <Area
                    type="monotone"
                    dataKey="temperature"
                    stroke={COLORS.gold}
                    fill="url(#temperatureGradient)"
                    strokeWidth={1.5}
                    dot={(props) => {
                        const {
                            cx,
                            cy,
                            index,
                        } = props;

                        if (
                            index ===
                                formattedData.length -
                                    1 &&
                            typeof cx ===
                                "number" &&
                            typeof cy ===
                                "number"
                        ) {
                            return (
                                <circle
                                    key={`latest-${index}`}
                                    cx={cx}
                                    cy={cy}
                                    r={4}
                                    fill={
                                        COLORS.gold
                                    }
                                    stroke="white"
                                    strokeWidth={1}
                                />
                            );
                        }

                        return null;
                    }}
                    activeDot={{
                        r: 6,
                        strokeWidth: 0,
                    }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}