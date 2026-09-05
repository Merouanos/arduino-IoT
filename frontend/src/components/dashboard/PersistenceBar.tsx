import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    AnimatePresence,
    motion,
} from "framer-motion";

interface PersistenceBarProps {
    active: boolean;
    duration: number;
    label: string;
    trackColor: string;
    fillStartColor: string;
    fillEndColor: string;
    labelColor: string;
}

export default function PersistenceBar({
    active,
    duration,
    label,
    trackColor,
    fillStartColor,
    fillEndColor,
    labelColor,
}: PersistenceBarProps) {
    const [progress, setProgress] =
        useState(0);

    const startRef =
        useRef<number | null>(null);

    const rafRef =
        useRef<number | null>(null);

    useEffect(() => {
        if (!active) {
            setProgress(0);
            startRef.current = null;

            if (rafRef.current !== null) {
                cancelAnimationFrame(
                    rafRef.current
                );
            }

            return;
        }

        const tick = (now: number) => {
            if (startRef.current === null) {
                startRef.current = now;
            }

            const percentage = Math.min(
                (now - startRef.current) /
                    duration,
                1
            );

            setProgress(percentage);

            if (percentage < 1) {
                rafRef.current =
                    requestAnimationFrame(
                        tick
                    );
            } else {
                startRef.current = null;
            }
        };

        rafRef.current =
            requestAnimationFrame(tick);

        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(
                    rafRef.current
                );
            }
        };
    }, [active, duration]);

    return (
        <AnimatePresence>
            {active && (
                <motion.div
                    initial={{
                        opacity: 0,
                        scaleY: 0,
                    }}
                    animate={{
                        opacity: 1,
                        scaleY: 1,
                    }}
                    exit={{
                        opacity: 0,
                        scaleY: 0,
                    }}
                    className="mt-3 w-full"
                >
                    <div
                        className="mb-1 flex justify-between font-mono text-[10px] tracking-[1px]"
                        style={{
                            color: labelColor,
                        }}
                    >
                        <span>{label}</span>

                        <span>
                            {(
                                (progress *
                                    duration) /
                                1000
                            ).toFixed(1)}
                            s /{" "}
                            {(
                                duration / 1000
                            ).toFixed(1)}
                            s
                        </span>
                    </div>

                    <div
                        className="h-0.5 overflow-hidden rounded-full"
                        style={{
                            background:
                                trackColor,
                        }}
                    >
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${
                                    (
                                        progress *
                                        100
                                    ).toFixed(
                                        1
                                    )
                                }%`,
                                background: `linear-gradient(90deg, ${fillStartColor}, ${fillEndColor})`,
                            }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}