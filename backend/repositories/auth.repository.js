import * as db from '../db/index.js';



export const findByEmail = async (email) => {
    const result = await db.query(
        'SELECT id, email, password_hash, name FROM users WHERE email = $1',
        [email]
    );

    return result.rows[0] ?? null;
};

export const createUser = async ({ name, email, password_hash }) => {
    const result = await db.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, balance',
        [name, email, password_hash]
    );

    return result.rows[0];
}



