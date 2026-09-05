import { api } from "./client";
import type {
    LoginResponse,
    UpdateUserData,
    User,
} from "../types/auth";

export async function register(
    email: string,
    password: string
) {
    const response = await api.post<{
        user: User;
    }>("/auth/register", {
        email,
        password,
    });

    return response.data;
}

export async function login(
    email: string,
    password: string
) {
    const response =
        await api.post<LoginResponse>(
            "/auth/login",
            {
                email,
                password,
            }
        );

    return response.data;
}

export async function updateUser(
    data: UpdateUserData
) {
    const response = await api.patch<{
        user: User;
    }>("/auth/me", data);

    return response.data;
}