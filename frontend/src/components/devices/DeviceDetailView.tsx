import { useState } from "react";

import type { Device } from "../../types/device";
import DeviceActions from "./DeviceActions";
import {
    COLORS,
    DEVICE_STATUS,
    getDeviceStatus,
} from "./Constant";

interface DeviceDetailViewProps {
    device: Device | null;
    onClose: () => void;
    onRename: (deviceId: string, name: string) => Promise<void>;
    onDelete: (deviceId: string) => Promise<void>;
    onRegenerateKey: (deviceId: string) => Promise<string>;
}

export default function DeviceDetailView({
    device,
    onClose,
    onRename,
    onDelete,
    onRegenerateKey,
}: DeviceDetailViewProps) {
    const [copied, setCopied] = useState(false);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [keyCopied, setKeyCopied] = useState(false);

    if (!device) {
        return null;
    }

    const deviceId = device.id;
    const status = getDeviceStatus(device.lastSeenAt);
    const statusColor =
        status === DEVICE_STATUS.ONLINE
            ? COLORS.nominal
            : status === DEVICE_STATUS.STALE
              ? COLORS.warning
              : COLORS.critical;

    async function copyDeviceId() {
        try {
            await navigator.clipboard.writeText(deviceId);
        } catch {
            const textArea = document.createElement("textarea");
            textArea.value = deviceId;
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            textArea.remove();
        }

        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    }

    async function handleRegenerateKey(deviceId: string) {
        const key = await onRegenerateKey(deviceId);
        setGeneratedKey(key);
        setKeyCopied(false);
    }

    async function copyGeneratedKey() {
        if (!generatedKey) {
            return;
        }

        try {
            await navigator.clipboard.writeText(generatedKey);
        } catch {
            const textArea = document.createElement("textarea");
            textArea.value = generatedKey;
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            textArea.remove();
        }

        setKeyCopied(true);
        window.setTimeout(() => setKeyCopied(false), 1600);
    }

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto"
            style={{
                background: COLORS.background,
            }}
        >
            <div className="mx-auto min-h-screen max-w-5xl px-5 pb-12 pt-5 sm:px-8 sm:pt-8">
                <header className="flex items-start justify-between gap-5 border-b pb-6" style={{ borderColor: COLORS.cardBorder }}>
                    <div>
                        <p className="font-mono text-[10px] tracking-[2.5px]" style={{ color: COLORS.gold }}>
                            DEVICE PROFILE
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold" style={{ color: COLORS.champagne }}>
                            {device.name}
                        </h1>
                        <p className="mt-2 font-mono text-[10px] tracking-[1.5px]" style={{ color: statusColor }}>
                            {status} SENSOR
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border px-4 py-3 font-mono text-[10px] tracking-[1.5px]"
                        style={{
                            color: COLORS.muted,
                            borderColor: COLORS.cardBorder,
                        }}
                    >
                        CLOSE
                    </button>
                </header>

                <section className="grid gap-4 py-6 sm:grid-cols-2">
                    <div className="rounded-2xl border p-5 sm:col-span-2" style={{ background: COLORS.cardBg, borderColor: COLORS.cardBorder }}>
                        <p className="font-mono text-[10px] tracking-[1.5px]" style={{ color: COLORS.muted }}>
                            DEVICE ID
                        </p>
                        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <code className="break-all font-mono text-sm" style={{ color: COLORS.champagne }}>
                                {device.id}
                            </code>
                            <button
                                type="button"
                                onClick={() => void copyDeviceId()}
                                className="shrink-0 rounded-xl px-4 py-3 font-mono text-[10px] font-semibold tracking-[1.2px]"
                                style={{
                                    color: COLORS.background,
                                    background: COLORS.gold,
                                }}
                            >
                                {copied ? "ID COPIED" : "COPY ID"}
                            </button>
                        </div>
                    </div>

                    <DetailItem label="STATUS" value={status} valueColor={statusColor} />
                    <DetailItem
                        label="LAST SEEN"
                        value={
                            device.lastSeenAt
                                ? new Date(device.lastSeenAt).toLocaleString()
                                : "NEVER"
                        }
                    />
                    <DetailItem
                        label="CREATED"
                        value={new Date(device.createdAt).toLocaleString()}
                    />
                    <DetailItem label="DEVICE NAME" value={device.name} />
                </section>

                <section
                    className="rounded-2xl border p-5 sm:p-6"
                    style={{
                        background: COLORS.cardBg,
                        borderColor: COLORS.cardBorder,
                    }}
                >
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="font-mono text-[10px] tracking-[1.8px]" style={{ color: COLORS.gold }}>
                                DEVICE CONTROLS
                            </p>
                            <p className="mt-1 text-sm" style={{ color: COLORS.muted }}>
                                Manage this sensor connection and identity.
                            </p>
                        </div>
                        <p className="font-mono text-[9px] tracking-[1px]" style={{ color: COLORS.subtle }}>
                            CHANGES APPLY IMMEDIATELY
                        </p>
                    </div>

                    <DeviceActions
                        deviceId={device.id}
                        deviceName={device.name}
                        onRename={onRename}
                        onDelete={onDelete}
                        onRegenerateKey={handleRegenerateKey}
                    />
                </section>

                {generatedKey && (
                    <section
                        className="mt-4 rounded-2xl border p-5 sm:p-6"
                        style={{
                            background: COLORS.warningBg,
                            borderColor: `${COLORS.warning}55`,
                        }}
                    >
                        <p className="font-mono text-[10px] tracking-[1.8px]" style={{ color: COLORS.warning }}>
                            NEW DEVICE KEY
                        </p>
                        <p className="mt-2 text-sm" style={{ color: COLORS.champagne }}>
                            Copy this key now. It will not be shown again.
                        </p>
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <code className="min-w-0 flex-1 break-all rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-xs" style={{ color: COLORS.warning }}>
                                {generatedKey}
                            </code>
                            <button
                                type="button"
                                onClick={() => void copyGeneratedKey()}
                                className="rounded-xl px-4 py-3 font-mono text-[10px] font-semibold tracking-[1px]"
                                style={{
                                    color: COLORS.background,
                                    background: COLORS.warning,
                                }}
                            >
                                {keyCopied ? "KEY COPIED" : "COPY KEY"}
                            </button>
                        </div>
                    </section>
                )}

                <p className="mt-5 font-mono text-[10px] leading-relaxed" style={{ color: COLORS.subtle }}>
                    Keep the device key private. Regenerating it immediately invalidates the previous key.
                </p>
            </div>
        </div>
    );
}

interface DetailItemProps {
    label: string;
    value: string;
    valueColor?: string;
}

function DetailItem({ label, value, valueColor = COLORS.champagne }: DetailItemProps) {
    return (
        <div className="rounded-2xl border p-5" style={{ background: COLORS.cardBg, borderColor: COLORS.cardBorder }}>
            <p className="font-mono text-[10px] tracking-[1.5px]" style={{ color: COLORS.muted }}>
                {label}
            </p>
            <p className="mt-3 break-words text-sm" style={{ color: valueColor }}>
                {value}
            </p>
        </div>
    );
}
