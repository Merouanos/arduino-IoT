import type { ReactNode } from "react";
import { COLORS } from "./Constant";

interface CardLabelProps {
    children: ReactNode;
}

export default function CardLabel({
    children,
}: CardLabelProps) {
    return (
        <span
            className="mb-3.5 block font-mono text-[10px] uppercase tracking-[2.5px]"
            style={{
                color: COLORS.muted,
            }}
        >
            {children}
        </span>
    );
}