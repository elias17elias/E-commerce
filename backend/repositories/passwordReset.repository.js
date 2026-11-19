import * as db from '../db/index.js';
import { UnauthorizedError } from '../utils/AppError.js';

export const createResetPasswordToken = async (hashedToken, userId, expiresAt) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN');
        await client.query('SELECT id FROM users WHERE id = $1 FOR NO KEY UPDATE', [userId]);
        await client.query(
            'UPDATE reset_password_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL',
            [userId]
        );
        await client.query(
            'INSERT INTO reset_password_tokens (token_hash, user_id, expires_at) VALUES ($1, $2, $3)',
            [hashedToken, userId, expiresAt]
        );
        await client.query('COMMIT');
    } catch (error) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            console.error('Password reset token creation rollback failed:', rollbackError);
        }
        throw error;
    } finally {
        client.release();
    }
};

export const resetPassword = async (hashedToken, passwordHash) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const result = await client.query(
            `SELECT id, user_id
            FROM reset_password_tokens
            WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
            FOR UPDATE`,
            [hashedToken]
        );
        const resetToken = result.rows[0];

        if (!resetToken) {
            throw new UnauthorizedError('Invalid or expired reset token');
        }

        await client.query(
            'UPDATE users SET password_hash = $1 WHERE id = $2',
            [passwordHash, resetToken.user_id]
        );
        await client.query(
            'UPDATE reset_password_tokens SET used_at = NOW() WHERE id = $1',
            [resetToken.id]
        );
        await client.query(
            'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
            [resetToken.user_id]
        );

        await client.query('COMMIT');
    } catch (error) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            console.error('Password reset rollback failed:', rollbackError);
        }
        throw error;
    } finally {
        client.release();
    }
};