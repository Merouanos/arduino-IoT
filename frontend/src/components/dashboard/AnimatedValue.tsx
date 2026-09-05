import { useEffect } from "react";
import {
    motion,
    useSpring,
    useTransform,
} from "framer-motion";

import { ANIMATION } from "./Constant";

interface AnimatedValueProps {
    value: number;
    decimals?: number;
}

export default function AnimatedValue({
    value,
    decimals = 1,
}: AnimatedValueProps) {
    const spring = useSpring(value, {
        stiffness: ANIMATION.springStiffness,
        damping: ANIMATION.springDamping,
    });

    const display = useTransform(
        spring,
        (current) => current.toFixed(decimals)
    );

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    return <motion.span>{display}</motion.span>;
}