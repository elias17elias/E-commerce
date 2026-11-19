import * as authRepository from '../repositories/auth.repository.js';
import * as refreshTokenRepository from '../repositories/refreshToken.repository.js';
import * as passwordResetRepository from '../repositories/passwordReset.repository.js';
import { UnauthorizedError, ConflictError } from '../utils/AppError.js';
import { generateToken } from '../utils/accessToken.js';
import { generateSecureToken, hashToken } from '../utils/secureToken.js';
import argon2 from 'argon2';
import crypto from 'node:crypto';
import * as emailService from './email.service.js';

const createSession = async (userId) => {

    const refreshToken = generateSecureToken();
    const hashedRefreshToken = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const familyId = crypto.randomUUID();

    await refreshTokenRepository.createRefreshToken(userId, hashedRefreshToken, familyId, expiresAt);

    const accessToken = generateToken(userId);

    return { accessToken, refreshToken };
};

export const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await authRepository.findByEmail(normalizedEmail);

    if (!user || !(await argon2.verify(user.password_hash, password))) {
        throw new UnauthorizedError('Invalid email or password');
    }
    return await createSession(user.id);
};

export const register = async ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const emailExists = await authRepository.findByEmail(normalizedEmail);

    if (emailExists) {
        throw new ConflictError('Email already exists');
    }

    const hashedPassword = await argon2.hash(password);

    const newUser = await authRepository.createUser({
        name: name.trim(),
        email: normalizedEmail,
        password_hash: hashedPassword
    });

    return newUser;
};

export const resetRefreshToken = async (refreshToken) => {
    const hashedRefreshToken = hashToken(refreshToken);

    
    const newRefreshToken = generateSecureToken();
    const newHashedRefreshToken = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const user_id = await refreshTokenRepository.rotateRefreshToken(hashedRefreshToken, newHashedRefreshToken, expiresAt);

    const accessToken = generateToken(user_id);

    return { accessToken, newRefreshToken };
};

export const logout = async (refreshToken) => {
    const hashedRefreshToken = hashToken(refreshToken);
    await refreshTokenRepository.revokeTokenFamily(hashedRefreshToken);
    
};

export const logoutAll = async (userId) => {
    await refreshTokenRepository.revokeRefreshTokens(userId);
}

export const forgotPassword = async(email) => {
    const user = await authRepository.findByEmail(email);
    if (!user) {
        return;
    }
    const { id: userId } = user;
    const token = generateSecureToken();
    const hashedToken = hashToken(token);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    


    await passwordResetRepository.createResetPasswordToken(hashedToken, userId, expiresAt);
    
    await emailService.sendPasswordResetEmail(email,token);

}



export const resetPassword = async (token, newPassword) => {
    const hashedToken = hashToken(token);
    const passwordHash = await argon2.hash(newPassword);
    await passwordResetRepository.resetPassword(hashedToken, passwordHash);
};
