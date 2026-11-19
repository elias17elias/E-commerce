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
    pgm.createTable('refresh_tokens', {
        id: 'id',
        user_id: {
            type: 'integer',
            notNull: true,
            references: '"users"',
            onDelete: 'cascade',
        },
        token_hash: {
            type: 'varchar(64)',
            notNull: true,
            unique: true,
        },
        family_id: {
            type: 'uuid',
            notNull: true,
        }
        ,
        expires_at: {
            type: 'TIMESTAMPTZ',
            notNull: true,
        },
        revoked_at: {
            type: 'TIMESTAMPTZ',
        },
        created_at: {
            type: 'TIMESTAMPTZ',
            notNull: true,
            default: pgm.func('now()'),
        },
    });
    pgm.sql(`CREATE INDEX idx_refresh_tokens_active_family_id ON
            refresh_tokens (family_id)
            WHERE revoked_at IS NULL;
            CREATE INDEX idx_refresh_tokens_active_user_id ON
            refresh_tokens (user_id)
            WHERE revoked_at IS NULL;`);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('refresh_tokens');
};
