import { AppError } from './AppError.js';

const createdAtPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/;

export const encodeKeysetCursor = ({ createdAt, id }) => {
    return Buffer.from(JSON.stringify({ createdAt, id })).toString('base64url');
};

export const decodeKeysetCursor = (value) => {
    if (
        typeof value !== 'string' ||
        value.length > 256 ||
        !/^[A-Za-z0-9_-]+$/.test(value)
    ) {
        throw new AppError('Invalid cursor', 400);
    }

    let cursor;
    try {
        cursor = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
    } catch {
        throw new AppError('Invalid cursor', 400);
    }

    const dateIsValid =
        cursor &&
        typeof cursor.createdAt === 'string' &&
        createdAtPattern.test(cursor.createdAt) &&
        Number.isFinite(Date.parse(cursor.createdAt)) &&
        new Date(cursor.createdAt).toISOString().slice(0, 19) ===
            cursor.createdAt.slice(0, 19);
    if (
        !dateIsValid ||
        !Number.isInteger(cursor.id) ||
        cursor.id < 1 ||
        cursor.id > 2147483647 ||
        encodeKeysetCursor(cursor) !== value
    ) {
        throw new AppError('Invalid cursor', 400);
    }

    return { createdAt: cursor.createdAt, id: cursor.id };
};
