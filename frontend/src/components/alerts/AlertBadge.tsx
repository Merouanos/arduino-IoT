import { motion } from "framer-motion";

import {
    getAlertColor,
} from "./Constant";

interface AlertBadgeProps {
    severity: string;
}

export default function AlertBadge({
    severity,
}: AlertBadgeProps) {
    const color =
        getAlertColor(severity);

    const active =
        severity === "critical" ||
        severity === "warning";

    return (
        <div className="flex items-center gap-2">
            <motion.div
                animate={
                    active
                        ? {
                              opacity: [
                                  1,
                                  0.25,
                                  1,
                              ],
                          }
                        : {
                              opacity: 1,
                          }
                }
                transition={{
                    repeat: active
                        ? Infinity
                        : 0,
                    duration:
                        severity ===
                        "critical"
                            ? 0.65
                            : 1.4,
                }}
                className="h-1.5 w-1.5 rounded-full"
                style={{
                    background: color,
                }}
            />

            <span
                className="font-mono text-[9px] font-semibold uppercase tracking-[1.5px]"
                style={{
                    color,
                }}
            >
                {severity}
            </span>
        </div>
    );
}