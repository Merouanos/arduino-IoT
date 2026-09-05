import { motion } from "framer-motion";

import {
    ANIMATION,
    COLORS,
    type DashboardStatus,
} from "./Constant";

interface StatusBadgeProps {
    state: DashboardStatus;
}

export default function StatusBadge({
    state,
}: StatusBadgeProps) {
    const color = COLORS.Status[state];
    const isAlert = state !== "NOMINAL";

    return (
        <div className="flex items-center gap-1.5">
            <motion.div
                key={state}
                animate={{
                    opacity: isAlert
                        ? [1, 0.1, 1]
                        : 1,
                }}
                transition={{
                    repeat: isAlert
                        ? Infinity
                        : 0,
                    duration:
                        state === "WARNING"
                            ? ANIMATION.statusBlinkSecWarning
                            : ANIMATION.statusBlinkSecCritical,
                }}
                className="h-1.5 w-1.5 rounded-full"
                style={{
                    background: color,
                }}
            />

            <span
                className="font-mono text-[11px] font-semibold tracking-[2px]"
                style={{
                    color,
                }}
            >
                {state}
            </span>
        </div>
    );
}