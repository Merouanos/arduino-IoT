import { useState, type FormEvent } from "react";

import { useAuth } from "../context/AuthContext";
import { COLORS } from "../components/devices/Constant";

export default function AccountPage() {
    const { user, updateUser } = useAuth();
    const [email, setEmail] = useState(user?.email ?? "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (newPassword && currentPassword.length < 8) {
            setError("Enter your current password to change it");
            return;
        }

        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            await updateUser({
                email: email.trim(),
                ...(newPassword
                    ? {
                          currentPassword,
                          newPassword,
                      }
                    : {}),
            });
            setCurrentPassword("");
            setNewPassword("");
            setMessage("ACCOUNT UPDATED");
        } catch {
            setError("Unable to update account");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main
            className="min-h-[calc(100vh-4rem)] px-4 pb-12 pt-6 sm:px-6"
            style={{
                background: COLORS.background,
                color: COLORS.champagne,
            }}
        >
            <div className="mx-auto max-w-3xl">
                <header className="mb-8">
                    <p
                        className="font-mono text-[10px] tracking-[2.5px]"
                        style={{ color: COLORS.gold }}
                    >
                        ACCOUNT
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold">
                        PROFILE SETTINGS
                    </h1>
                    <p
                        className="mt-2 text-sm"
                        style={{ color: COLORS.muted }}
                    >
                        Manage your sign-in details and monitoring workspace access.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <section
                        className="rounded-2xl border p-5 sm:p-6"
                        style={{
                            background: COLORS.cardBg,
                            borderColor: COLORS.cardBorder,
                        }}
                    >
                        <div className="mb-5">
                            <p
                                className="font-mono text-[10px] tracking-[1.8px]"
                                style={{ color: COLORS.gold }}
                            >
                                IDENTITY
                            </p>
                            <p
                                className="mt-1 text-xs"
                                style={{ color: COLORS.muted }}
                            >
                                Your account email is used for authentication.
                            </p>
                        </div>

                        <label
                            className="mb-2 block font-mono text-[10px] tracking-[1.5px]"
                            style={{ color: COLORS.muted }}
                        >
                            EMAIL ADDRESS
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                            style={{
                                color: COLORS.champagne,
                                background: COLORS.inputBg,
                                borderColor: COLORS.inputBorder,
                            }}
                        />

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    className="mb-2 block font-mono text-[10px] tracking-[1.5px]"
                                    style={{ color: COLORS.muted }}
                                >
                                    CURRENT PASSWORD
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(event) =>
                                        setCurrentPassword(event.target.value)
                                    }
                                    placeholder="Only for password changes"
                                    minLength={8}
                                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                                    style={{
                                        color: COLORS.champagne,
                                        background: COLORS.inputBg,
                                        borderColor: COLORS.inputBorder,
                                    }}
                                />
                            </div>
                            <div>
                                <label
                                    className="mb-2 block font-mono text-[10px] tracking-[1.5px]"
                                    style={{ color: COLORS.muted }}
                                >
                                    NEW PASSWORD
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(event) =>
                                        setNewPassword(event.target.value)
                                    }
                                    minLength={8}
                                    placeholder="Leave blank to keep it"
                                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                                    style={{
                                        color: COLORS.champagne,
                                        background: COLORS.inputBg,
                                        borderColor: COLORS.inputBorder,
                                    }}
                                />
                            </div>
                        </div>
                    </section>

                    {(error || message) && (
                        <p
                            className="rounded-xl border px-4 py-3 font-mono text-xs"
                            style={{
                                color: error ? COLORS.critical : COLORS.nominal,
                                background: error
                                    ? COLORS.dangerBg
                                    : COLORS.successBg,
                                borderColor: error
                                    ? `${COLORS.critical}33`
                                    : `${COLORS.nominal}33`,
                            }}
                        >
                            {error ?? message}
                        </p>
                    )}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-mono text-[10px]" style={{ color: COLORS.subtle }}>
                            MEMBER SINCE {user?.createdAt
                                ? new Date(user.createdAt).toLocaleDateString()
                                : "UNKNOWN"}
                        </p>
                        <button
                            type="submit"
                            disabled={loading || !email.trim()}
                            className="rounded-xl px-5 py-3 font-mono text-[10px] font-semibold tracking-[1.5px] transition-opacity disabled:opacity-40"
                            style={{
                                color: COLORS.background,
                                background: COLORS.gold,
                            }}
                        >
                            {loading ? "SAVING..." : "SAVE CHANGES"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
