import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { login as loginApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const result = await loginApi(
                email,
                password
            );

            login(result.user, result.token);

            navigate("/dashboard");
        } catch (error: any) {
            setError(
                error?.response?.data?.message ??
                "Unable to log in"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
                <h1 className="mb-6 text-3xl font-bold text-white">
                    Sign in
                </h1>

                {error && (
                    <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                        {error}
                    </p>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-white px-4 py-3 font-medium text-black disabled:opacity-50"
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign in"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-zinc-400">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-white underline"
                    >
                        Register
                    </Link>
                </p>
            </div>
        </main>
    );
}