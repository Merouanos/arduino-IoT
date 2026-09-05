import { useLocation } from "react-router-dom";

import { useDevices } from "../../context/DeviceContext";

import { COLORS } from "../devices/Constant";

export default function TopBar() {
    const location = useLocation();

    const {
        devices,
        selectedDeviceId,
        selectDevice,
    } = useDevices();

    const title =
        location.pathname === "/dashboard"
            ? "LIVE MONITOR"
            : location.pathname === "/devices"
              ? "DEVICE NETWORK"
                                : location.pathname === "/activity"
                                    ? "SENSOR ACTIVITY"
                            : location.pathname === "/readings"
                                ? "READING HISTORY"
                                : location.pathname === "/alerts"
                                    ? "ALERT CENTER"
              : "SYSTEM";

    const showDeviceSelector =
                ["/dashboard", "/activity", "/readings", "/alerts"].includes(
                        location.pathname
                ) &&
        devices.length > 0;

    return (
        <header
            className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b px-4 md:ml-60 md:px-6"
            style={{
                background:
                    "rgba(5,5,5,0.78)",
                backdropFilter:
                    "blur(24px)",
                borderColor:
                    "rgba(255,255,255,0.07)",
            }}
        >
            <div>
                <div
                    className="font-mono text-[9px] tracking-[2px]"
                    style={{
                        color: COLORS.muted,
                    }}
                >
                    V2 SYSTEM
                </div>

                <div
                    className="mt-1 text-sm font-medium"
                    style={{
                        color:
                            COLORS.champagne,
                    }}
                >
                    {title}
                </div>
            </div>

            {showDeviceSelector && (
                <div className="flex items-center gap-3">
                    <span
                        className="hidden font-mono text-[9px] tracking-[1.5px] sm:inline"
                        style={{
                            color:
                                COLORS.muted,
                        }}
                    >
                        DEVICE
                    </span>

                    <select
                        value={
                            selectedDeviceId ??
                            ""
                        }
                        onChange={(event) =>
                            selectDevice(
                                event.target.value
                            )
                        }
                        className="cursor-pointer rounded-lg border px-3 py-2 font-mono text-[10px] outline-none"
                        style={{
                            color:
                                COLORS.champagne,
                            background:
                                "rgba(255,255,255,0.035)",
                            borderColor:
                                "rgba(255,255,255,0.10)",
                        }}
                    >
                        {devices.map(
                            (device) => (
                                <option
                                    key={
                                        device.id
                                    }
                                    value={
                                        device.id
                                    }
                                    style={{
                                        background:
                                            "#080808",
                                    }}
                                >
                                    {device.name}
                                </option>
                            )
                        )}
                    </select>
                </div>
            )}
        </header>
    );
}