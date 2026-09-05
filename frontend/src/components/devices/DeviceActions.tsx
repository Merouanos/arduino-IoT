import { useState } from "react";

interface DeviceActionsProps {
    deviceId: string;
    deviceName: string;
    onRename: (
        deviceId: string,
        name: string
    ) => Promise<void>;
    onDelete: (
        deviceId: string
    ) => Promise<void>;
    onRegenerateKey: (
        deviceId: string
    ) => Promise<void>;
}

export default function DeviceActions({
    deviceId,
    deviceName,
    onRename,
    onDelete,
    onRegenerateKey,
}: DeviceActionsProps) {
    const [mode, setMode] =
        useState<
            "rename" | "delete" | "regenerate" | null
        >(null);
    const [name, setName] = useState(deviceName);
    const [loading, setLoading] = useState(false);

    async function runAction(action: () => Promise<unknown>) {
        setLoading(true);

        try {
            await action();
            setMode(null);
        } finally {
            setLoading(false);
        }
    }

    function handleRenameSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const nextName = name.trim();

        if (!nextName || nextName === deviceName) {
            setMode(null);
            return;
        }

        void runAction(() => onRename(deviceId, nextName));
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
            <button
                type="button"
                onClick={() => setMode("rename")}
                className="rounded-xl border border-white/10 px-4 py-3 font-mono text-[10px] tracking-[1px] text-zinc-400 transition hover:border-yellow-500/30 hover:text-yellow-300"
            >
                RENAME
            </button>

            <button
                type="button"
                onClick={() => setMode("regenerate")}
                className="rounded-xl border border-white/10 px-4 py-3 font-mono text-[10px] tracking-[1px] text-zinc-400 transition hover:border-yellow-500/30 hover:text-yellow-300"
            >
                REGENERATE KEY
            </button>

            <button
                type="button"
                onClick={() => setMode("delete")}
                className="rounded-xl border border-red-500/10 px-4 py-3 font-mono text-[10px] tracking-[1px] text-red-400 transition hover:border-red-500/30 hover:bg-red-500/5"
            >
                DELETE
            </button>
            </div>

            {mode === "rename" && (
                <form onSubmit={handleRenameSubmit} className="flex flex-col gap-3 rounded-xl border border-white/10 p-4 sm:flex-row sm:items-end">
                    <label className="min-w-0 flex-1">
                        <span className="mb-2 block font-mono text-[9px] tracking-[1.2px] text-zinc-500">
                            NEW DEVICE NAME
                        </span>
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            autoFocus
                            required
                            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-200 outline-none focus:border-yellow-500/40"
                        />
                    </label>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setMode(null)} className="rounded-lg border border-white/10 px-3 py-2 font-mono text-[9px] text-zinc-500">
                            CANCEL
                        </button>
                        <button type="submit" disabled={loading} className="rounded-lg bg-yellow-500 px-3 py-2 font-mono text-[9px] font-semibold text-black disabled:opacity-50">
                            {loading ? "SAVING..." : "SAVE"}
                        </button>
                    </div>
                </form>
            )}

            {(mode === "delete" || mode === "regenerate") && (
                <div className="flex flex-col gap-3 rounded-xl border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="font-mono text-[10px] tracking-[1px] text-zinc-300">
                            {mode === "delete" ? "DELETE DEVICE?" : "REGENERATE DEVICE KEY?"}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                            {mode === "delete"
                                ? "This removes the device and its management link."
                                : "The current key will stop working immediately."}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setMode(null)} className="rounded-lg border border-white/10 px-3 py-2 font-mono text-[9px] text-zinc-500">
                            CANCEL
                        </button>
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() =>
                                void runAction(
                                    mode === "delete"
                                        ? () => onDelete(deviceId)
                                        : () => onRegenerateKey(deviceId)
                                )
                            }
                            className={`rounded-lg px-3 py-2 font-mono text-[9px] font-semibold text-black disabled:opacity-50 ${mode === "delete" ? "bg-red-400" : "bg-yellow-500"}`}
                        >
                            {loading ? "WORKING..." : "CONFIRM"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}