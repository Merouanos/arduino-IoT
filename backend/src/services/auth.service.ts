import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as userRepository from "../repositories/user.repository";
import { logger } from "../lib/logger";

function generateToken(userId: string) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

export async function register(
    email: string,
    password: string
) {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
        logger.warn("Registration attempt with existing email");
        throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const data: userRepository.CreateUserData = {
        email,
        passwordHash,
    };

    const user = await userRepository.create(data);

    logger.info("User registered successfully", user.id);

    return {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
    };
}

export async function login(
    email: string,
    password: string
) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
        logger.warn("Login attempt with invalid credentials");
        throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isMatch) {
        logger.warn("Login attempt with invalid credentials");
        throw new Error("Invalid credentials");
    }

    const token = generateToken(user.id);

    logger.info("User logged in successfully", user.id);

    return {
        user: {
            id: user.id,
            email: user.email,
            createdAt: user.created_at,
        },
        token,
    };
}

export async function updateUser(
    id: string,
    email?: string,
    currentPassword?: string,
    newPassword?: string
) {
    const existingUser = await userRepository.findById(id);

    if (!existingUser) {
        logger.warn("Attempt to update nonexistent user", id);
        throw new Error("User not found");
    }

    const emailChanged =
        email !== undefined &&
        email !== existingUser.email;

    const passwordChanged =
        newPassword !== undefined;

    if (!emailChanged && !passwordChanged) {
        logger.warn("User update requested with no changes", id);
        throw new Error("Nothing to update");
    }

    if (emailChanged) {
        const emailExists =
            await userRepository.findByEmail(email);

        if (emailExists && emailExists.id !== id) {
            logger.warn("Attempt to change email to one already in use");
            throw new Error("Email already in use");
        }
    }

    let passwordHash: string | undefined;

    if (passwordChanged) {
        if (!currentPassword) {
            throw new Error("Current password is required");
        }

        const isCurrentPasswordValid = await bcrypt.compare(
            currentPassword,
            existingUser.password_hash
        );

        if (!isCurrentPasswordValid) {
            logger.warn("Incorrect current password during password change");
            throw new Error("Current password is incorrect");
        }

        if (newPassword === currentPassword) {
            logger.warn("User attempted to reuse current password", id);
            throw new Error(
                "New password must be different from current password"
            );
        }

        passwordHash = await bcrypt.hash(newPassword, 12);
    }

    const updateData: userRepository.UpdateUserData = {
        email: emailChanged ? email : undefined,
        passwordHash,
    };

    const user = await userRepository.update(
        id,
        updateData
    );

    if (!user) {
        logger.error("Failed to update user", id);
        throw new Error("Failed to update user");
    }

    logger.info("User updated successfully", user.id);

    return {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
    };
}