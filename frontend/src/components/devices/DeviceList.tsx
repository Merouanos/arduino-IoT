import type { Device } from "../../types/device";

import DeviceCard from "./DeviceCard";

interface DeviceListProps {
    devices: Device[];
    simulatorActiveIds?: Set<string>;
    selectedDeviceId: string | null;
    onSelect: (deviceId: string) => void;
    onOpenDetails?: (deviceId: string) => void;
}

export default function DeviceList({
    devices,
    simulatorActiveIds = new Set<string>(),
    selectedDeviceId,
    onSelect,
    onOpenDetails,
}: DeviceListProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {devices.map((device) => (
                <DeviceCard
                    key={device.id}
                    device={device}
                    simulatorActive={simulatorActiveIds.has(device.id)}
                    selected={
                        device.id ===
                        selectedDeviceId
                    }
                    onSelect={onSelect}
                    onOpenDetails={onOpenDetails}
                />
            ))}
        </div>
    );
}