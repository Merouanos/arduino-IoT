export const STATUS = {
    0: "NOMINAL",
    1: "WARNING",
    2: "CRITICAL",
} as const;

export type DashboardStatus =
    (typeof STATUS)[keyof typeof STATUS];

export function resolveStatus(
    code: number
): DashboardStatus {
    if (code === 2) {
        return "CRITICAL";
    }

    if (code === 1) {
        return "WARNING";
    }

    return "NOMINAL";
}

export const COLORS = {
    background: "#050505",

    champagne: "#F3E7C5",
    gold: "#D4AF37",
    goldDim: "#8F7725",

    muted: "#8A877E",

    nominal: "#6EE7A2",
    warning: "#F5C451",
    critical: "#FF5C5C",

    humidityNormal: "#D4AF37",
    humidityHigh: "#F5C451",
    humidityLow: "#7DD3FC",

    deltaHot: "#FF8A65",
    deltaCold: "#7DD3FC",

    ambientGlow: "rgba(212, 175, 55, 0.10)",

    headerBg: "rgba(5, 5, 5, 0.78)",
    headerBorder: "rgba(212, 175, 55, 0.12)",

    cardBg: "rgba(255, 255, 255, 0.035)",
    cardBorder: "rgba(255, 255, 255, 0.08)",
    cardBorderGlow: "rgba(212, 175, 55, 0.35)",

    cardGlowOff: "rgba(212, 175, 55, 0)",
    cardGlowOn: "rgba(212, 175, 55, 0.28)",

    cardShimmer: "rgba(212, 175, 55, 0.18)",

    latencyBg: "rgba(110, 231, 162, 0.06)",
    latencyBorder: "rgba(110, 231, 162, 0.18)",

    humTrack: "rgba(255, 255, 255, 0.06)",
    sramTrack: "rgba(255, 255, 255, 0.06)",
    persistTrack: "rgba(255, 255, 255, 0.07)",

    sramHealthy: "#6EE7A2",
    sramLow: "#F5C451",
    sramCritical: "#FF5C5C",

    footerBorder: "rgba(255, 255, 255, 0.07)",

    heatAlphaMin: 0.18,
    heatAlphaRange: 0.72,
    heatAlphaRedMax: 0.85,
    heatAlphaRedMin: 0.20,

    Status: {
        NOMINAL: "#6EE7A2",
        WARNING: "#F5C451",
        CRITICAL: "#FF5C5C",
    } satisfies Record<DashboardStatus, string>,
} as const;

export const THRESHOLDS = {
    temp: {
        baseline: 24,
        deltaHotAbove: 28,
        warning: 27,
        critical: 30,
    },

    humidity: {
        warningLow: 35,
        warningHigh: 70,
        criticalLow: 25,
        criticalHigh: 80,
    },

    sram: {
        maxBytes: 2048,
        lowPct: 30,
        criticalPct: 15,
    },
} as const;

export const ANIMATION = {
    springStiffness: 120,
    springDamping: 20,

    statusBlinkSecWarning: 1.4,
    statusBlinkSecCritical: 0.65,

    persistDurationMs: 5000,

    glowDurationSec: 1.8,

    latencyPulseSec: 1.4,

    heatCellDelay: 0.015,
} as const;

export const LAYOUT = {
    historyWindow: 48,

    heatGridCols: 24,

    heatGridMin: 20,
    heatGridMax: 34,
    heatGridRedMax: 34,

    maxContentWidth: 1400,
    rightColWidth: 360,
} as const;

export const LABELS = {
    appTitle: "CLIMATE STABILITY",
    appSubtitle: "ENVIRONMENTAL MONITORING SYSTEM",

    cardTemp: "TEMPERATURE",
    cardHumidity: "HUMIDITY",
    cardSram: "MEMORY HEALTH",
    cardHistory: "RECENT HISTORY",
    cardTrend: "TEMPERATURE TREND",

    sensorPin: "DHT11 · PIN 13",

    latencyUnit: "LATENCY",

    persistLabel: "PERSISTENCE",

    humDry: "DRY",
    humIdeal: "IDEAL",
    humWet: "WET",

    sramTotal: "TOTAL",
    sramUsed: "USED",
    sramArchitecture: "ARCH",
    sramArch: "ATmega328P",

    footerCopy: "ARDUINO IoT DASHBOARD · V2",
    liveFeed: "LIVE FEED",
} as const;