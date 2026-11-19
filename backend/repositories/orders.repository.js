import * as db from '../db/index.js';
import { ConflictError, NotFoundError } from '../utils/AppError.js';
import { encodeKeysetCursor } from '../utils/keysetCursor.js';

const decimalToCents = (value) => {
    const [units, fraction = ''] = String(value).split('.');
    return BigInt(units) * 100n + BigInt(fraction.padEnd(2, '0'));
};

const centsToDecimal = (cents) => {
    const units = cents / 100n;
    const fraction = String(cents % 100n).padStart(2, '0');
    return `${units}.${fraction}`;
};

export const findAll = async ({ cursor, limit, filters }) => {
    const conditions = [];
    const params = [];
    const bind = (value) => {
        params.push(value);
        return `$${params.length}`;
    };

    if (filters.status !== undefined) {
        conditions.push(`status = ${bind(filters.status)}`);
    }
    if (filters.userId !== undefined) {
        conditions.push(`user_id = ${bind(filters.userId)}`);
    }
    if (cursor) {
        const createdAtParam = bind(cursor.createdAt);
        const idParam = bind(cursor.id);
        conditions.push(`(created_at, id) < (${createdAtParam}::timestamptz, ${idParam}::integer)`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limitParam = bind(limit + 1);
    const ordersResult = await db.query(
            `SELECT id, user_id, status,
                to_char(orders.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS created_at
            FROM orders
            ${whereClause}
            ORDER BY orders.created_at DESC, orders.id DESC
            LIMIT ${limitParam}`,
            params
    );

    const hasMore = ordersResult.rows.length > limit;
    const data = ordersResult.rows.slice(0, limit);
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
        `SELECT orders.id, orders.user_id, orders.status,
            order_items.id AS order_item_id,
            order_items.product_id,
            products.name AS product_name,
            order_items.quantity,
            order_items.price
        FROM orders
        LEFT JOIN order_items ON order_items.order_id = orders.id
        LEFT JOIN products ON products.id = order_items.product_id
        WHERE orders.id = $1
        ORDER BY order_items.id`,
        [id]
    );
    if (result.rows.length === 0) {
        return null;
    }

    const order = {
        id: result.rows[0].id,
        user_id: result.rows[0].user_id,
        status: result.rows[0].status,
        order_items: result.rows
            .filter(row => row.order_item_id !== null)
            .map(({ order_item_id, product_id, product_name, quantity, price }) => ({
                id: order_item_id,
                product_id,
                product_name,
                quantity,
                price,
            })),
    };

    return order;
};

const restoreStock = async (client, orderId) => {
    const items = await client.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1 ORDER BY product_id',
        [orderId]
    );

    for (const item of items.rows) {
        const result = await client.query(
            `UPDATE products
            SET stock = stock + $1
            WHERE id = $2 AND stock <= 2147483647 - $1`,
            [item.quantity, item.product_id]
        );
        if (result.rowCount === 0) {
            throw new ConflictError(
                `Cannot restore stock for product ${item.product_id}`
            );
        }
    }
};

const lockUser = async (client, userId) => {
    const result = await client.query(
        'SELECT id, balance FROM users WHERE id = $1 FOR UPDATE',
        [userId]
    );
    if (result.rowCount === 0) {
        throw new NotFoundError(`User with id ${userId} not found`);
    }
    return result.rows[0];
};

const refundOrderBalance = async (client, userId, orderId) => {
    const totalResult = await client.query(
        'SELECT COALESCE(SUM(price * quantity), 0) AS total FROM order_items WHERE order_id = $1',
        [orderId]
    );
    const result = await client.query(
        `UPDATE users
        SET balance = balance + $1::numeric
        WHERE id = $2 AND balance <= 9999999999.99 - $1::numeric
        RETURNING balance`,
        [totalResult.rows[0].total, userId]
    );
    if (result.rowCount === 0) {
        throw new ConflictError('Order refund would exceed the maximum balance');
    }
};

export const create = async ({ userId, data }) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const user = await lockUser(client, userId);

        const productIds = data.map(item => item.product_id);
        
        const productResult = await client.query(
            `SELECT id, price, stock FROM products
            WHERE id = ANY($1:: int[])
            ORDER BY id
            FOR UPDATE`,
            [productIds]
        );
        const priceMap = new Map(productResult.rows.map(p => [p.id, p.price]));

        for (const item of data) {
            if (!priceMap.has(item.product_id)) {
                throw new NotFoundError(`Product with id ${item.product_id} not found`);
            }
        }

        const totalCents = data.reduce(
            (total, item) =>
                total + decimalToCents(priceMap.get(item.product_id)) * BigInt(item.quantity),
            0n
        );
        if (totalCents > decimalToCents(user.balance)) {
            throw new ConflictError('Insufficient balance');
        }

        const updateStockQuery = `
            UPDATE products
            SET stock = stock - $1
            WHERE id = $2 AND stock >= $1
        `;

        for (const item of data) {
            const updated = await client.query(updateStockQuery,
                [item.quantity, item.product_id]);
            if (updated.rowCount === 0) {
                throw new ConflictError(`Insufficient stock for product ${item.product_id}`);
            }
        }

        const balanceResult = await client.query(
            `UPDATE users
            SET balance = balance - $1::numeric
            WHERE id = $2 AND balance >= $1::numeric
            RETURNING balance`,
            [centsToDecimal(totalCents), userId]
        );
        if (balanceResult.rowCount === 0) {
            throw new ConflictError('Insufficient balance');
        }

        const orderResult = await client.query(`INSERT INTO orders (user_id, status) 
            VALUES($1, $2)
            RETURNING id, user_id, status`, [userId, 'pending']);
        const orderId = orderResult.rows[0].id;

        const insertQuery = `
            INSERT INTO order_items (order_id, product_id, quantity, price)
            VALUES ($1, $2, $3, $4)
        `;

        for (const item of data) {
            const unitPrice = priceMap.get(item.product_id);
            await client.query(insertQuery, [orderId, item.product_id, item.quantity, unitPrice]);
        }

        await client.query('COMMIT');
        return { ...orderResult.rows[0], balance: balanceResult.rows[0].balance };
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

export const updateStatus = async (id, status) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const orderResult = await client.query(
            'SELECT id, user_id, status FROM orders WHERE id = $1 FOR UPDATE',
            [id]
        );
        const order = orderResult.rows[0];
        if (!order) {
            await client.query('COMMIT');
            return null;
        }
        if (order.status === status) {
            await client.query('COMMIT');
            return order;
        }
        if (order.status !== 'pending') {
            throw new ConflictError('Only pending orders can change status');
        }
        if (status === 'cancelled') {
            await lockUser(client, order.user_id);
            await restoreStock(client, id);
            await refundOrderBalance(client, order.user_id, id);
        }

        const result = await client.query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, user_id, status',
            [status, id]
        );
        await client.query('COMMIT');
        return result.rows[0] ?? null;
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

export const deleteById = async (id) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const orderResult = await client.query(
            'SELECT id, user_id, status FROM orders WHERE id = $1 FOR UPDATE',
            [id]
        );
        const order = orderResult.rows[0];
        if (!order) {
            await client.query('COMMIT');
            return null;
        }
        if (order.status === 'pending') {
            await lockUser(client, order.user_id);
            await restoreStock(client, id);
            await refundOrderBalance(client, order.user_id, id);
        }

        const result = await client.query(
            'DELETE FROM orders WHERE id = $1 RETURNING id',
            [id]
        );
        await client.query('COMMIT');
        return result.rows[0] ?? null;
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
