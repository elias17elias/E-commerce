import * as db from '../db/index.js';
import { encodeKeysetCursor } from '../utils/keysetCursor.js';

export const findAll = async ({ cursor, limit, filters }) => {
    const conditions = [];
    const params = [];
    const bind = (value) => {
        params.push(value);
        return `$${params.length}`;
    };

    if (filters.q !== undefined) {
        conditions.push(`position(lower(${bind(filters.q)}) in lower(name)) > 0`);
    }
    if (filters.minPrice !== undefined) {
        conditions.push(`price >= ${bind(filters.minPrice)}::numeric`);
    }
    if (filters.maxPrice !== undefined) {
        conditions.push(`price <= ${bind(filters.maxPrice)}::numeric`);
    }
    if (filters.minStock !== undefined) {
        conditions.push(`stock >= ${bind(filters.minStock)}`);
    }
    if (filters.maxStock !== undefined) {
        conditions.push(`stock <= ${bind(filters.maxStock)}`);
    }
    if (filters.inStock !== undefined) {
        conditions.push(filters.inStock ? 'stock > 0' : 'stock = 0');
    }
    if (cursor) {
        const createdAtParam = bind(cursor.createdAt);
        const idParam = bind(cursor.id);
        conditions.push(`(created_at, id) < (${createdAtParam}::timestamptz, ${idParam}::integer)`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limitParam = bind(limit + 1);
    const productsResult = await db.query(
            `SELECT id, name, price, stock,
                to_char(products.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS created_at
            FROM products
            ${whereClause}
            ORDER BY products.created_at DESC, products.id DESC
            LIMIT ${limitParam}`,
            params
    );

    const hasMore = productsResult.rows.length > limit;
    const data = productsResult.rows.slice(0, limit);
    return {
        data,
        pagination: {
            limit,
            hasMore,
            nextCursor: hasMore
                ? encodeKeysetCursor({
                    createdAt: data[data.length - 1].created_at,
                    id: data[data.length - 1].id,
                })
                : null,
        },
    };
};

export const findById = async (id) => {
    const result = await db.query(
        `SELECT id, name, price, stock,
            to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS created_at
        FROM products WHERE id = $1`,
        [id]
    );

    return result.rows[0] ?? null;
};

export const create = async ({ name, price, stock }) => {
    const result = await db.query(
        `INSERT INTO products (name, price, stock)
        VALUES ($1, $2, $3)
        RETURNING id, name, price, stock,
            to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS created_at`,
        [name, price, stock]
    );

    return result.rows[0];
};

export const update = async (id, { name, price, stock }) => {
    const result = await db.query(
        `UPDATE products
        SET name = $1, price = $2, stock = $3
        WHERE id = $4
        RETURNING id, name, price, stock,
            to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS created_at`,
        [name, price, stock, id]
    );

    return result.rows[0];
};

export const deleteById = async (id) => {
    const result = await db.query(
        'DELETE FROM products WHERE id = $1 RETURNING id',
        [id]
    );
    return result.rows[0] ?? null;
};
