import { NavLink } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
    COLORS,
} from "../devices/Constant";

const navigation = [
    {
        label: "DASHBOARD",
        path: "/dashboard",
    },
    {
        label: "DEVICES",
        path: "/devices",
    },
    {
        label: "ACTIVITY",
        path: "/activity",
    },
    {
        label: "ACCOUNT",
        path: "/account",
    },
];

export default function Sidebar() {
    const { user, logout } = useAuth();

    return (
        <aside
            className="fixed inset-x-0 bottom-0 z-30 flex h-16 w-full flex-row border-t px-3 py-2 md:inset-y-0 md:left-0 md:h-auto md:w-60 md:flex-col md:border-r md:border-t-0 md:px-4 md:py-5"
            style={{
                background: COLORS.background,
                borderColor:
                    "rgba(255,255,255,0.07)",
            }}
        >
            {/* Brand */}
            <div className="mb-8 hidden px-2 md:block">
                <div
                    className="font-mono text-[11px] font-semibold tracking-[2px]"
                    style={{
                        color: COLORS.gold,
                    }}
                >
                    CLIMATE STABILITY
                </div>

                <div
                    className="mt-1 text-[9px] tracking-[1px]"
                    style={{
                        color: COLORS.muted,
                    }}
                >
                    ENVIRONMENTAL MONITORING
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-1 items-center justify-around gap-1 md:block md:flex-none md:space-y-1">
                {navigation.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className="block"
                    >
                        {({ isActive }) => (
                            <div
                                className="cursor-pointer rounded-xl px-3 py-2.5 text-center font-mono text-[9px] tracking-[1px] transition-all duration-200 md:text-left md:text-[10px] md:tracking-[1.5px]"
                                style={{
                                    color: isActive
                                        ? COLORS.champagne
                                        : COLORS.muted,

                                    background:
                                        isActive
                                            ? "rgba(212,175,55,0.08)"
                                            : "transparent",

                                    border: `1px solid ${
                                        isActive
                                            ? "rgba(212,175,55,0.16)"
                                            : "transparent"
                                    }`,
                                }}
                            >
                                {item.label}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Account */}
            <div className="mt-auto hidden md:block">
                <div
                    className="mb-3 rounded-xl border p-3"
                    style={{
                        background:
                            "rgba(255,255,255,0.025)",
                        borderColor:
                            "rgba(255,255,255,0.07)",
                    }}
                >
                    <div
                        className="font-mono text-[9px] tracking-[1px]"
                        style={{
                            color: COLORS.muted,
                        }}
                    >
                        SIGNED IN AS
                    </div>

                    <div
                        className="mt-1 truncate text-sm"
                        style={{
                            color:
                                COLORS.champagne,
                        }}
                    >
                        {user?.email}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={logout}
                    className="w-full cursor-pointer rounded-xl border px-3 py-2.5 font-mono text-[10px] tracking-[1.5px] transition-colors duration-200 hover:bg-white/[0.03]"
                    style={{
                        color: COLORS.muted,
                        borderColor:
                            "rgba(255,255,255,0.07)",
                    }}
                >
                    SIGN OUT
                </button>
            </div>
        </aside>
    );
}