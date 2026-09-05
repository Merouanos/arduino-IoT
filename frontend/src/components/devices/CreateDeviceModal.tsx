import {
    useState,
    type FormEvent,
} from "react";

import { createDevice } from "../../api/device.api";

import type {
    CreateDeviceResponse,
} from "../../types/device";

import {
    COLORS,
    LABELS,
} from "./Constant";

interface CreateDeviceModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (
        result: CreateDeviceResponse
    ) => void;
}

export default function CreateDeviceModal({
    open,
    onClose,
    onCreated,
}: CreateDeviceModalProps) {
    const [name, setName] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [deviceKey, setDeviceKey] =
        useState<string | null>(null);

    if (!open) {
        return null;
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setLoading(true);
        setError(null);

        try {
            const result =
                await createDevice({
                    name: name.trim(),
                });

            setDeviceKey(
                result.deviceKey
            );

            onCreated(result);
        } catch {
            setError(
                "Failed to create device"
            );
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        setName("");
        setError(null);
        setDeviceKey(null);
        onClose();
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{
                background:
                    COLORS.modalOverlay,
                backdropFilter:
                    "blur(10px)",
            }}
        >
            <div
                className="relative w-full max-w-md overflow-hidden rounded-2xl p-6"
                style={{
                    background:
                        COLORS.modalBg,
                    border: `1px solid ${COLORS.cardBorder}`,
                    boxShadow:
                        "0 24px 80px rgba(0,0,0,0.5)",
                }}
            >
                <div
                    className="absolute left-0 right-0 top-0 h-px"
                    style={{
                        background: `linear-gradient(
                            90deg,
                            transparent,
                            ${COLORS.gold},
                            transparent
                        )`,
                    }}
                />

                {!deviceKey ? (
                    <>
                        <div className="mb-6">
                            <p
                                className="font-mono text-[10px] tracking-[2.5px]"
                                style={{
                                    color:
                                        COLORS.gold,
                                }}
                            >
                                {LABELS.createTitle}
                            </p>

                            <h2
                                className="mt-2 text-xl font-medium"
                                style={{
                                    color:
                                        COLORS.champagne,
                                }}
                            >
                                {LABELS.createSubtitle}
                            </h2>
                        </div>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="space-y-5"
                        >
                            <div>
                                <label
                                    className="mb-2 block font-mono text-[10px] uppercase tracking-[1.5px]"
                                    style={{
                                        color:
                                            COLORS.muted,
                                    }}
                                >
                                    {
                                        LABELS.deviceName
                                    }
                                </label>

                                <input
                                    value={name}
                                    onChange={(
                                        event
                                    ) =>
                                        setName(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    required
                                    autoFocus
                                    placeholder="Living Room Sensor"
                                    className="w-full rounded-xl px-4 py-3 font-mono text-sm outline-none transition"
                                    style={{
                                        color:
                                            COLORS.champagne,
                                        background:
                                            COLORS.inputBg,
                                        border: `1px solid ${COLORS.inputBorder}`,
                                    }}
                                />
                            </div>

                            {error && (
                                <div
                                    className="rounded-xl p-3 font-mono text-xs"
                                    style={{
                                        color:
                                            COLORS.critical,
                                        background:
                                            COLORS.dangerBg,
                                        border: `1px solid ${COLORS.critical}22`,
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={
                                        handleClose
                                    }
                                    className="flex-1 rounded-xl border px-4 py-3 font-mono text-xs tracking-[1px]"
                                    style={{
                                        color:
                                            COLORS.muted,
                                        borderColor:
                                            COLORS.cardBorder,
                                    }}
                                >
                                    {
                                        LABELS.cancel
                                    }
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        !name.trim()
                                    }
                                    className="flex-1 rounded-xl px-4 py-3 font-mono text-xs font-semibold tracking-[1px] transition-opacity disabled:opacity-40"
                                    style={{
                                        color:
                                            COLORS.background,
                                        background:
                                            COLORS.gold,
                                    }}
                                >
                                    {loading
                                        ? "CREATING..."
                                        : LABELS.create}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div>
                        <p
                            className="font-mono text-[10px] tracking-[2.5px]"
                            style={{
                                color:
                                    COLORS.nominal,
                            }}
                        >
                            DEVICE CREATED
                        </p>

                        <h2
                            className="mt-2 text-xl font-medium"
                            style={{
                                color:
                                    COLORS.champagne,
                            }}
                        >
                            Save your device key
                        </h2>

                        <p
                            className="mt-3 text-sm leading-relaxed"
                            style={{
                                color:
                                    COLORS.muted,
                            }}
                        >
                            {LABELS.keyWarning}
                        </p>

                        <div
                            className="mt-5 rounded-xl p-4"
                            style={{
                                background:
                                    COLORS.warningBg,
                                border: `1px solid ${COLORS.warning}22`,
                            }}
                        >
                            <code
                                className="block break-all font-mono text-xs leading-relaxed"
                                style={{
                                    color:
                                        COLORS.warning,
                                }}
                            >
                                {deviceKey}
                            </code>
                        </div>

                        <button
                            type="button"
                            onClick={
                                handleClose
                            }
                            className="mt-5 w-full rounded-xl px-4 py-3 font-mono text-xs font-semibold tracking-[1px]"
                            style={{
                                color:
                                    COLORS.background,
                                background:
                                    COLORS.gold,
                            }}
                        >
                            {LABELS.done}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}