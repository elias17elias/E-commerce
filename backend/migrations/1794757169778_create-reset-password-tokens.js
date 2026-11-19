/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createTable('reset_password_tokens', {
        id: 'id',
        user_id: {
            type: 'integer',
            notNull: true,
            references: '"users"',
            onDelete:'CASCADE',
        },
        token_hash: {
            type: 'varchar(64)',
            unique: true,
            notNull:true,
        },
        used_at: {
            type: 'TIMESTAMPTZ',
        },
        expires_at: {
            type: 'TIMESTAMPTZ',
            notNull: true,
        },created_at: {
            type: 'TIMESTAMPTZ',
            notNull: true,
            default: pgm.func('now()'),
        },
    })
    pgm.sql(`CREATE INDEX idx_reset_password_tokens_user_id
            ON reset_password_tokens (user_id)
            WHERE used_at IS NULL`);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('reset_password_tokens');
};
