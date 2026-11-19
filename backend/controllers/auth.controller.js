import * as authService from "../services/auth.service.js";
import * as usersService from "../services/users.service.js";
import { refreshCookieOptions } from "../config/cookieOptions.js";
import { AppError, UnauthorizedError } from "../utils/AppError.js";
import {
    assertAllowedProperties,
    MAX_PASSWORD_LENGTH,
    validateEmailAddress,
} from '../middleware/validate.js';

export const login = async (req, res, next) => {

    const { email, password } = req.body;
    const { accessToken, refreshToken } = await authService.login(email, password);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    res.status(200).json({ accessToken });

};

export const register = async (req, res, next) => {

    const { name, email, password } = req.body;
    const newUser = await authService.register({ name, email, password });
    res.status(201).json(newUser);

};

export const getMe = async (req, res, next) => {

    const userId = req.user.id;
    const user = await usersService.getUserById(userId);
    res.status(200).json(user);

};


export const resetRefreshToken = async (req, res, next) => {

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new UnauthorizedError('Missing refresh token');
    }

    const { accessToken, newRefreshToken } = await authService.resetRefreshToken(refreshToken);
    res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);
    res.status(200).json({ accessToken });
};

export const logout = async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new UnauthorizedError('Missing refresh token')
    }
    await authService.logout(refreshToken);
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/auth'
    });
    res.status(200).json({ message: 'Logged out successfully' });
}

export const logoutAll = async (req, res, next) => {
    const userId = req.user.id;
    await authService.logoutAll(userId);

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/auth'
    });

    res.status(200).json({ message: 'Logged out successfully' })
};


export const forgotPassword = async (req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        throw new AppError('Request body must be a JSON object', 400);
    }

    assertAllowedProperties(req.body, ['email']);
    const { email } = req.body;

    if (typeof email !== 'string' || email.trim() === '') {
        throw new AppError('Valid email is required', 400);
    }
    validateEmailAddress(email);

    await authService.forgotPassword(email.trim().toLowerCase());

    return res.status(200).json({
        message: 'If an account exists with that email, a password reset link has been sent.'
    });
};

export const resetPassword = async (req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        throw new AppError('Request body must be a JSON object', 400);
    }

    assertAllowedProperties(req.body, ['token', 'newPassword']);
    const { token, newPassword } = req.body;

    if (typeof token !== 'string' || token.trim() === '') {
        throw new AppError('Valid reset token is required', 400);
    }

    if (
        typeof newPassword !== 'string' ||
        newPassword.trim() === '' ||
        newPassword.length < 8 ||
        newPassword.length > MAX_PASSWORD_LENGTH
    ) {
        throw new AppError('Valid password is required', 400);
    }

    await authService.resetPassword(token, newPassword);

    return res.status(200).json({
        message: 'Password has been reset successfully.'
    });
};
