"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.updateUser = updateUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRepository = __importStar(require("../repositories/user.repository"));
const logger_1 = require("../lib/logger");
const app_error_1 = require("../lib/app.error");
function generateToken(userId) {
    if (!process.env.JWT_SECRET) {
        throw new app_error_1.AppError("Authentication service unavailable", 500);
    }
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
async function register(email, password) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
        logger_1.logger.warn("Registration attempt with existing email");
        throw new app_error_1.AppError("User already exists", 409);
    }
    const passwordHash = await bcrypt_1.default.hash(password, 12);
    const data = {
        email,
        passwordHash,
    };
    const user = await userRepository.create(data);
    logger_1.logger.info("User registered successfully", user.id);
    return {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
    };
}
async function login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
        logger_1.logger.warn("Login attempt with invalid credentials");
        throw new app_error_1.AppError("Invalid credentials", 401);
    }
    const isMatch = await bcrypt_1.default.compare(password, user.password_hash);
    if (!isMatch) {
        logger_1.logger.warn("Login attempt with invalid credentials");
        throw new app_error_1.AppError("Invalid credentials", 401);
    }
    const token = generateToken(user.id);
    logger_1.logger.info("User logged in successfully", user.id);
    return {
        user: {
            id: user.id,
            email: user.email,
            createdAt: user.created_at,
        },
        token,
    };
}
async function updateUser(id, email, currentPassword, newPassword) {
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
        logger_1.logger.warn("Attempt to update nonexistent user", id);
        throw new app_error_1.AppError("User not found", 404);
    }
    const emailChanged = email !== undefined &&
        email !== existingUser.email;
    const passwordChanged = newPassword !== undefined;
    if (!emailChanged && !passwordChanged) {
        logger_1.logger.warn("User update requested with no changes", id);
        throw new app_error_1.AppError("Nothing to update", 400);
    }
    if (emailChanged) {
        const emailExists = await userRepository.findByEmail(email);
        if (emailExists && emailExists.id !== id) {
            logger_1.logger.warn("Attempt to change email to one already in use");
            throw new app_error_1.AppError("Email already in use", 409);
        }
    }
    let passwordHash;
    if (passwordChanged) {
        if (!currentPassword) {
            throw new app_error_1.AppError("Current password is required", 400);
        }
        const isCurrentPasswordValid = await bcrypt_1.default.compare(currentPassword, existingUser.password_hash);
        if (!isCurrentPasswordValid) {
            logger_1.logger.warn("Incorrect current password during password change");
            throw new app_error_1.AppError("Current password is incorrect", 401);
        }
        if (newPassword === currentPassword) {
            logger_1.logger.warn("User attempted to reuse current password", id);
            throw new app_error_1.AppError("New password must be different from current password", 400);
        }
        passwordHash = await bcrypt_1.default.hash(newPassword, 12);
    }
    const updateData = {
        email: emailChanged ? email : undefined,
        passwordHash,
    };
    const user = await userRepository.update(id, updateData);
    if (!user) {
        // Unexpected database/application failure.
        // Let error middleware handle and log it.
        throw new Error("Failed to update user");
    }
    logger_1.logger.info("User updated successfully", user.id);
    return {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
    };
}
