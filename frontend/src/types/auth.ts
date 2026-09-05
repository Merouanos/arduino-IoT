export interface User {
    id: string;
    email: string;
    createdAt: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface UpdateUserData {
    email?: string;
    currentPassword?: string;
    newPassword?: string;
}