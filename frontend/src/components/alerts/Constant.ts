export const COLORS = {
    champagne: "#F3E7C5",
    gold: "#D4AF37",
    muted: "#8A877E",

    nominal: "#6EE7A2",
    warning: "#F5C451",
    critical: "#FF5C5C",

    cardBg: "rgba(255, 255, 255, 0.035)",
    cardBorder: "rgba(255, 255, 255, 0.08)",

    warningBg: "rgba(245, 196, 81, 0.06)",
    criticalBg: "rgba(255, 92, 92, 0.06)",
    resolvedBg: "rgba(110, 231, 162, 0.04)",
} as const;

export function getAlertColor(
    severity: string
) {
    switch (severity) {
        case "critical":
            return COLORS.critical;

        case "warning":
            return COLORS.warning;

        default:
            return COLORS.muted;
    }
}