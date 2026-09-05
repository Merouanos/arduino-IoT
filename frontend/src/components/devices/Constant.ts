export const COLORS = {
    background: "#050505",

    champagne: "#F3E7C5",
    gold: "#D4AF37",
    goldDim: "#8F7725",

    muted: "#8A877E",
    subtle: "#5F5C55",

    nominal: "#6EE7A2",
    warning: "#F5C451",
    critical: "#FF5C5C",

    cardBg: "rgba(255, 255, 255, 0.035)",
    cardBorder: "rgba(255, 255, 255, 0.08)",
    cardBorderHover: "rgba(212, 175, 55, 0.20)",
    cardBorderSelected: "rgba(212, 175, 55, 0.38)",

    shimmer: "rgba(212, 175, 55, 0.18)",

    modalBg: "rgba(8, 8, 8, 0.96)",
    modalOverlay: "rgba(0, 0, 0, 0.72)",

    inputBg: "rgba(255, 255, 255, 0.035)",
    inputBorder: "rgba(255, 255, 255, 0.10)",
    inputFocus: "rgba(212, 175, 55, 0.45)",

    dangerBg: "rgba(255, 92, 92, 0.06)",
    warningBg: "rgba(245, 196, 81, 0.06)",
    successBg: "rgba(110, 231, 162, 0.06)",
} as const;

export const DEVICE_STATUS = {
    ONLINE: "ONLINE",
    STALE: "STALE",
    OFFLINE: "OFFLINE",
} as const;

export type DeviceStatus =
    (typeof DEVICE_STATUS)[keyof typeof DEVICE_STATUS];

export const STATUS_THRESHOLDS = {
    onlineSeconds: 10,
    staleSeconds: 60,
} as const;

export const ANIMATION = {
    cardDuration: 0.25,
    modalDuration: 0.2,
    hoverDuration: 0.2,
    statusPulse: 1.5,
} as const;

export const LABELS = {
    pageTitle: "DEVICES",
    pageSubtitle: "CONNECTED SENSOR NETWORK",

    addDevice: "ADD DEVICE",
    deviceId: "DEVICE ID",
    created: "CREATED",
    lastSeen: "LAST SEEN",

    online: "ONLINE",
    stale: "STALE",
    offline: "OFFLINE",

    rename: "RENAME",
    regenerateKey: "REGENERATE KEY",
    delete: "DELETE",

    createTitle: "REGISTER DEVICE",
    createSubtitle: "INITIALIZE A NEW SENSOR",

    deviceName: "DEVICE NAME",

    cancel: "CANCEL",
    create: "CREATE DEVICE",
    done: "DONE",

    keyWarning:
        "Save this device key. It will not be shown again.",

    noDevices: "NO DEVICES REGISTERED",
    noDevicesDescription:
        "Register a sensor to begin monitoring.",
} as const;

export function getDeviceStatus(
    lastSeenAt: string | null
): DeviceStatus {
    if (!lastSeenAt) {
        return DEVICE_STATUS.OFFLINE;
    }

    const lastSeen =
        new Date(lastSeenAt).getTime();

    const now = Date.now();

    const elapsedSeconds =
        (now - lastSeen) / 1000;

    if (
        elapsedSeconds <=
        STATUS_THRESHOLDS.onlineSeconds
    ) {
        return DEVICE_STATUS.ONLINE;
    }

    if (
        elapsedSeconds <=
        STATUS_THRESHOLDS.staleSeconds
    ) {
        return DEVICE_STATUS.STALE;
    }

    return DEVICE_STATUS.OFFLINE;
}