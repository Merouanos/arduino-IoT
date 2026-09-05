import type { ReactNode } from "react";
import { motion } from "framer-motion";

import {
    ANIMATION,
    COLORS,
} from "./Constant";

interface CardProps {
    children: ReactNode;
    className?: string;
    glow?: boolean;
}

export default function Card({
    children,
    className = "",
    glow = false,
}: CardProps) {
    return (
        <motion.div
            animate={
                glow
                    ? {
                          boxShadow: [
                              `0 0 0px 0px ${COLORS.cardGlowOff}`,
                              `0 0 28px 5px ${COLORS.cardGlowOn}`,
                              `0 0 0px 0px ${COLORS.cardGlowOff}`,
                          ],
                      }
                    : {
                          boxShadow: "none",
                      }
            }
            transition={{
                repeat: glow ? Infinity : 0,
                duration: ANIMATION.glowDurationSec,
                ease: "easeInOut",
            }}
            className={`relative overflow-hidden rounded-2xl p-5 ${className}`}
            style={{
                background: COLORS.cardBg,
                backdropFilter: "blur(20px)",
                border: `1px solid ${
                    glow
                        ? COLORS.cardBorderGlow
                        : COLORS.cardBorder
                }`,
            }}
        >
            <div
                className="absolute left-0 right-0 top-0 h-px"
                style={{
                    background: `linear-gradient(
                        90deg,
                        transparent,
                        ${COLORS.cardShimmer},
                        transparent
                    )`,
                }}
            />

            {children}
        </motion.div>
    );
}