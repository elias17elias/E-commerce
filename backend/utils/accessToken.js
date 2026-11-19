import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { UnauthorizedError } from './AppError.js';

export const generateToken = (id) => {
    return  jwt.sign({}, env.JWT_SECRET, {
        subject: String(id),
        expiresIn: env.JWT_EXPIRES_IN,
        algorithm: 'HS256'
    });
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, env.JWT_SECRET, {
            algorithms: ['HS256']
        });
    } catch (err) {
        throw new UnauthorizedError('Invalid or expired token');
    }
};

