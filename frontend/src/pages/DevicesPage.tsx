import {
    useState,
    useEffect,
} from "react";

import {
    deleteDevice,
    updateDevice,
    regenerateDeviceKey,
} from "../api/device.api";

import type {
    CreateDeviceResponse,
} from "../types/device";

import {
    useDevices,
} from "../context/DeviceContext";

import DeviceList from "../components/devices/DeviceList";
import CreateDeviceModal from "../components/devices/CreateDeviceModal";
import DeviceDetailView from "../components/devices/DeviceDetailView";

import {
    COLORS,
    LABELS,
} from "../components/devices/Constant";
import { getSimulatorStatus } from "../api/simulator.api";

export default function DevicesPage() {
    const {
        devices,
        selectedDeviceId,
        selectDevice,
        isLoading,
        error,
        refreshDevices,
    } = useDevices();

    const [
        showCreateModal,
        setShowCreateModal,
    ] = useState(false);

    const [
        actionError,
        setActionError,
    ] = useState<string | null>(null);

    const [detailDeviceId, setDetailDeviceId] =
        useState<string | null>(null);

    const [simulatorActiveIds, setSimulatorActiveIds] =
        useState<Set<string>>(new Set());

    useEffect(() => {
        let cancelled = false;

        async function loadSimulatorStatuses() {
            const statuses = await Promise.all(
                devices.map(async (device) => {
                    try {
                        const status = await getSimulatorStatus(device.id);
                        return status.active && !status.suspended
                            ? device.id
                            : null;
                    } catch {
                        return null;
                    }
                })
            );

            if (!cancelled) {
                setSimulatorActiveIds(
                    new Set(
                        statuses.filter(
                            (deviceId): deviceId is string => Boolean(deviceId)
                        )
                    )
                );
            }
        }

        if (devices.length === 0) {
            setSimulatorActiveIds(new Set());
        } else {
            void loadSimulatorStatuses();
        }

        return () => {
            cancelled = true;
        };
    }, [devices]);

    async function handleCreated(
        result: CreateDeviceResponse
    ) {
        await refreshDevices();

        selectDevice(
            result.device.id
        );
    }

    async function handleDelete(
        deviceId: string
    ) {
        try {
            setActionError(null);

            await deleteDevice(
                deviceId
            );

            setDetailDeviceId(null);

            await refreshDevices();
        } catch {
            setActionError(
                "Failed to delete device"
            );
        }
    }

    async function handleRename(
        deviceId: string,
        name: string
    ) {
        try {
            setActionError(null);

            await updateDevice(
                deviceId,
                { name }
            );

            await refreshDevices();
        } catch {
            setActionError(
                "Failed to update device"
            );
        }
    }

    async function handleRegenerateKey(
        deviceId: string
    ): Promise<string> {
        try {
            setActionError(null);

            const result =
                await regenerateDeviceKey(
                    deviceId
                );

            return result.deviceKey;
        } catch {
            setActionError(
                "Failed to regenerate device key"
            );
            throw new Error(
                "Failed to regenerate device key"
            );
        }
    }

    return (
        <main
            className="min-h-screen px-5 pb-12 pt-6"
            style={{
                background:
                    COLORS.background,
                color:
                    COLORS.champagne,
            }}
        >
            <div className="mx-auto max-w-[1400px]">
                <header className="mb-8 flex items-end justify-between">
                    <div>
                        <p
                            className="font-mono text-[10px] tracking-[2.5px]"
                            style={{
                                color:
                                    COLORS.gold,
                            }}
                        >
                            {LABELS.pageTitle}
                        </p>

                        <h1
                            className="mt-2 text-3xl font-semibold"
                            style={{
                                color:
                                    COLORS.champagne,
                            }}
                        >
                            {LABELS.pageSubtitle}
                        </h1>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setShowCreateModal(
                                true
                            )
                        }
                        className="cursor-pointer rounded-xl px-4 py-3 font-mono text-[10px] font-semibold tracking-[1.5px] transition-opacity hover:opacity-90"
                        style={{
                            color:
                                COLORS.background,
                            background:
                                COLORS.gold,
                        }}
                    >
                        + {LABELS.addDevice}
                    </button>
                </header>

                {(error ||
                    actionError) && (
                    <div
                        className="mb-5 rounded-xl p-4 font-mono text-xs"
                        style={{
                            color:
                                COLORS.critical,
                            background:
                                COLORS.dangerBg,
                            border: `1px solid ${COLORS.critical}22`,
                        }}
                    >
                        {actionError ?? error}
                    </div>
                )}

                {isLoading ? (
                    <div
                        className="rounded-2xl border p-10 text-center font-mono text-xs"
                        style={{
                            borderColor:
                                COLORS.cardBorder,
                            color:
                                COLORS.muted,
                        }}
                    >
                        LOADING DEVICES...
                    </div>
                ) : devices.length === 0 ? (
                    <div
                        className="rounded-2xl border p-12 text-center"
                        style={{
                            background:
                                COLORS.cardBg,
                            borderColor:
                                COLORS.cardBorder,
                        }}
                    >
                        <p
                            className="font-mono text-xs tracking-[2px]"
                            style={{
                                color:
                                    COLORS.muted,
                            }}
                        >
                            {LABELS.noDevices}
                        </p>

                        <p
                            className="mt-2 text-sm"
                            style={{
                                color:
                                    COLORS.subtle,
                            }}
                        >
                            {
                                LABELS.noDevicesDescription
                            }
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setShowCreateModal(
                                    true
                                )
                            }
                            className="mt-5 cursor-pointer rounded-xl px-4 py-3 font-mono text-[10px] font-semibold tracking-[1px] transition-opacity hover:opacity-90"
                            style={{
                                color:
                                    COLORS.background,
                                background:
                                    COLORS.gold,
                            }}
                        >
                            + {LABELS.addDevice}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <DeviceList
                            devices={devices}
                            simulatorActiveIds={simulatorActiveIds}
                            selectedDeviceId={
                                selectedDeviceId
                            }
                            onSelect={
                                selectDevice
                            }
                            onOpenDetails={
                                setDetailDeviceId
                            }
                        />

                    </div>
                )}

                <CreateDeviceModal
                    open={
                        showCreateModal
                    }
                    onClose={() =>
                        setShowCreateModal(
                            false
                        )
                    }
                    onCreated={
                        handleCreated
                    }
                />

                {detailDeviceId && (
                    <DeviceDetailView
                        device={
                            devices.find(
                                (device) =>
                                    device.id ===
                                    detailDeviceId
                            ) ?? null
                        }
                        onClose={() =>
                            setDetailDeviceId(null)
                        }
                        onRename={handleRename}
                        onDelete={handleDelete}
                        onRegenerateKey={
                            handleRegenerateKey
                        }
                    />
                )}
            </div>
        </main>
    );
}