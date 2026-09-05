import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import type { User } from "../types/auth";
import type { UpdateUserData } from "../types/auth";
import { updateUser as updateUserApi } from "../api/auth.api";

interface AuthContextValue {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: User, token: string) => void;
    updateUser: (data: UpdateUserData) => Promise<void>;
    logout: () => void;
}

const AuthContext =
    createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

function hasUsableToken(token: string) {
    try {
        const payload = token.split(".")[1];

        if (!payload) {
            return false;
        }

        const decoded = JSON.parse(
            window.atob(
                payload.replace(/-/g, "+").replace(/_/g, "/")
            )
        ) as { exp?: number };

        return !decoded.exp || decoded.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken =
            localStorage.getItem("token");

        const storedUser =
            localStorage.getItem("user");

        if (
            storedToken &&
            storedUser &&
            hasUsableToken(storedToken)
        ) {
            try {
                const parsedUser: User =
                    JSON.parse(storedUser);

                setToken(storedToken);
                setUser(parsedUser);
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }

        setIsLoading(false);
    }, []);

    function login(user: User, token: string) {
        localStorage.setItem("token", token);
        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        setToken(token);
        setUser(user);
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
    }

    async function updateUser(data: UpdateUserData) {
        const result = await updateUserApi(data);

        localStorage.setItem(
            "user",
            JSON.stringify(result.user)
        );
        setUser(result.user);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated:
                    !!user && !!token,
                isLoading,
                login,
                updateUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}