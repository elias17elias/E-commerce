import * as db from '../db/index.js';

export const findAll = async () => {
    const result = await db.query(
        'SELECT id, name, email, balance FROM users'
    );
    return result.rows;
};

export const findById = async (id) => {
    const result = await db.query(
        'SELECT id, name, email, role, balance FROM users WHERE id = $1',
        [id]
    );
    return result.rows[0];
};

export const deleteById = async (id) => {
    const result = await db.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
    );
    return result.rows[0] ?? null;
};

export const updateUserNameById = async (id, name) => {
    const result = await db.query(
        'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, balance',
        [name, id]
    );
    return result.rows[0] ?? null;
};

export const increaseBalanceById = async (id, amount) => {
    const result = await db.query(
        `UPDATE users
        SET balance = balance + $1::numeric
        WHERE id = $2 AND balance <= 9999999999.99 - $1::numeric
        RETURNING id, name, email, balance`,
        [amount, id]
    );
    return result.rows[0] ?? null;
};