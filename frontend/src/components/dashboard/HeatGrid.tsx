import { motion } from "framer-motion";

import {
    ANIMATION,
    COLORS,
    LAYOUT,
    THRESHOLDS,
} from "./Constant";

interface HeatGridProps {
    dataHistory: number[];
}

export default function HeatGrid({
    dataHistory,
}: HeatGridProps) {
    const cells = dataHistory.slice(
        -LAYOUT.historyWindow
    );

    if (cells.length === 0) {
        return (
            <div className="h-14 rounded-lg border border-white/5 bg-white/[0.02]" />
        );
    }

    const min =
        LAYOUT.heatGridMin ??
        Math.min(...cells);

    const max =
        LAYOUT.heatGridMax ??
        Math.max(...cells);

    const range = max - min || 1;

    const rangeRed =
        LAYOUT.heatGridRedMax -
        THRESHOLDS.temp.baseline;

    return (
        <div
            className="grid gap-1"
            style={{
                gridTemplateColumns: `repeat(${LAYOUT.heatGridCols}, minmax(0, 1fr))`,
            }}
        >
            {cells.map((value, index) => {
                const normalized =
                    (value - min) / range;

                const normalizedRed =
                    (value -
                        THRESHOLDS.temp.deltaHotAbove) /
                    (rangeRed || 1);

                const alpha = Math.min(
                    Number(
                        (
                            COLORS.heatAlphaMin +
                            normalized *
                                COLORS.heatAlphaRange
                        ).toFixed(2)
                    ),
                    1
                );

                const redAlpha = Math.max(
                    Number(
                        (
                            COLORS.heatAlphaRedMax -
                            normalizedRed *
                                COLORS.heatAlphaRange
                        ).toFixed(2)
                    ),
                    COLORS.heatAlphaRedMin
                );

                const background =
                    value <
                    THRESHOLDS.temp.deltaHotAbove
                        ? `rgba(212, 175, 55, ${alpha})`
                        : `rgba(255, 0, 0, ${redAlpha})`;

                return (
                    <motion.div
                        key={`${index}-${value}`}
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        transition={{
                            delay:
                                index *
                                ANIMATION.heatCellDelay,
                        }}
                        title={`Temperature: ${value.toFixed(
                            1
                        )}°C`}
                        style={{
                            background,
                        }}
                        className="h-3.5 rounded-xs"
                    />
                );
            })}
        </div>
    );
}