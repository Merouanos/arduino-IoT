import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as userRepository from "../repositories/user.repository";
import { logger } from "../lib/logger";
import { AppError } from "../lib/app.error";

function generateToken(userId: string) {
    if (!process.env.JWT_SECRET) {
        throw new AppError(
            "Authentication service unavailable",
            500
        );
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

        throw new AppError(
            "User already exists",
            409
        );
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

        throw new AppError(
            "Invalid credentials",
            401
        );
    }

    const isMatch = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isMatch) {
        logger.warn("Login attempt with invalid credentials");

        throw new AppError(
            "Invalid credentials",
            401
        );
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

        throw new AppError(
            "User not found",
            404
        );
    }

    const emailChanged =
        email !== undefined &&
        email !== existingUser.email;

    const passwordChanged =
        newPassword !== undefined;

    if (!emailChanged && !passwordChanged) {
        logger.warn("User update requested with no changes", id);

        throw new AppError(
            "Nothing to update",
            400
        );
    }

    if (emailChanged) {
        const emailExists =
            await userRepository.findByEmail(email);

        if (emailExists && emailExists.id !== id) {
            logger.warn(
                "Attempt to change email to one already in use"
            );

            throw new AppError(
                "Email already in use",
                409
            );
        }
    }

    let passwordHash: string | undefined;

    if (passwordChanged) {
        if (!currentPassword) {
            throw new AppError(
                "Current password is required",
                400
            );
        }

        const isCurrentPasswordValid =
            await bcrypt.compare(
                currentPassword,
                existingUser.password_hash
            );

        if (!isCurrentPasswordValid) {
            logger.warn(
                "Incorrect current password during password change"
            );

            throw new AppError(
                "Current password is incorrect",
                401
            );
        }

        if (newPassword === currentPassword) {
            logger.warn(
                "User attempted to reuse current password",
                id
            );

            throw new AppError(
                "New password must be different from current password",
                400
            );
        }

        passwordHash = await bcrypt.hash(
            newPassword,
            12
        );
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
        // Unexpected database/application failure.
        // Let error middleware handle and log it.
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