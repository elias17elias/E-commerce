import * as db from '../db/index.js';
import { UnauthorizedError } from '../utils/AppError.js';




export const createRefreshToken = async (userId, hashedRefreshToken, familyId, expiresAt) => {
    await db.query(
        'INSERT INTO refresh_tokens (user_id, token_hash, family_id, expires_at) VALUES ($1, $2, $3, $4)',
        [userId, hashedRefreshToken, familyId, expiresAt]
    );
};


export const rotateRefreshToken = async (oldHashedRefreshToken, newHashedRefreshToken, newExpiresAt) => {
    const client = await db.getClient();
    let transactionOpen = false;

    try {
        await client.query('BEGIN');
        transactionOpen = true;

        const oldRefreshToken = await client.query(
            'SELECT user_id, family_id, revoked_at, expires_at FROM refresh_tokens WHERE token_hash = $1 FOR UPDATE',
            [oldHashedRefreshToken]
        );
        
        if (!oldRefreshToken.rows[0]) {
            throw new UnauthorizedError('Invalid refresh token');
        }

        const {
            user_id: userId,
            family_id: familyId,
            expires_at: expiresAt,
            revoked_at: revokedAt,
        } = oldRefreshToken.rows[0];

        if (revokedAt) {
            await client.query(
                'UPDATE refresh_tokens SET revoked_at = NOW() WHERE family_id = $1 AND revoked_at IS NULL',
                [familyId]
            );
            await client.query('COMMIT');
            transactionOpen = false;
            throw new UnauthorizedError('Refresh token has been revoked');
        }
        if (Date.now() >= expiresAt.getTime()) {
            throw new UnauthorizedError('Refresh token has expired');
        }


        await client.query(
            'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1',
            [oldHashedRefreshToken]
        );

        await client.query(
            'INSERT INTO refresh_tokens (user_id, token_hash, family_id, expires_at) VALUES ($1, $2, $3, $4)',
            [userId, newHashedRefreshToken, familyId, newExpiresAt]
        );

        await client.query('COMMIT');
        transactionOpen = false;
        return userId;
    } catch (err) {
        if (transactionOpen) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackErr) {
                console.error('Rollback failed:', rollbackErr);
            }
        }

        throw err;
        
    } finally {
        client.release();
    }
};

export const revokeRefreshTokens = async (userId) => {
    await db.query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
        [userId]
    );
};

export const revokeTokenFamily = async (hashedRefreshToken) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN');
        

        const refreshToken = await client.query(
            'SELECT family_id FROM refresh_tokens WHERE token_hash = $1 FOR UPDATE',
            [hashedRefreshToken]
        );

        if (!refreshToken.rows[0]) {
            await client.query('COMMIT');
            return;
        }
        const { family_id: familyId } = refreshToken.rows[0];

        await client.query(
            'UPDATE refresh_tokens SET revoked_at = NOW() WHERE family_id = $1 AND revoked_at IS NULL',
            [familyId]
        );

        await client.query('COMMIT');
        
    } catch (err) {
        
            try {
                await client.query('ROLLBACK');
            } catch (rollbackErr) {
                console.error('Rollback failed:', rollbackErr);
            }
        

        throw err;
    } finally {
        client.release();
    }
};
