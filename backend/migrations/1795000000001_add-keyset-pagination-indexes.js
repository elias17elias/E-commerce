/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.sql(`
        DROP INDEX idx_orders_user_id;
        DROP INDEX idx_orders_status;

        CREATE INDEX idx_products_created_at_id
            ON products (created_at DESC, id DESC);
        CREATE INDEX idx_products_price ON products (price);
        CREATE INDEX idx_products_stock ON products (stock);
        CREATE INDEX idx_orders_created_at_id
            ON orders (created_at DESC, id DESC);
        CREATE INDEX idx_orders_status_created_at_id
            ON orders (status, created_at DESC, id DESC);
        CREATE INDEX idx_orders_user_id_created_at_id
            ON orders (user_id, created_at DESC, id DESC);
        CREATE INDEX idx_orders_user_status_created_at_id
            ON orders (user_id, status, created_at DESC, id DESC);
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.sql(`
        DROP INDEX idx_products_created_at_id;
        DROP INDEX idx_products_price;
        DROP INDEX idx_products_stock;
        DROP INDEX idx_orders_created_at_id;
        DROP INDEX idx_orders_status_created_at_id;
        DROP INDEX idx_orders_user_id_created_at_id;
        DROP INDEX idx_orders_user_status_created_at_id;

        CREATE INDEX idx_orders_user_id ON orders (user_id);
        CREATE INDEX idx_orders_status ON orders (status);
    `);
};
