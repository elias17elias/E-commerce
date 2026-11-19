import { Pool } from 'pg';
import env from '../config/env.js';

const pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    max: 10,                    // maximum connections in pool (default: 10)
    min: 0,                     // minimum idle connections (default: 0)
    idleTimeoutMillis: 30000,   // close idle connections after 30s (default: 10000)
    connectionTimeoutMillis: 5000, // fail if can't get connection in 5s (default: 0 = infinite)
    
});

pool.on('error', (err) => {
    console.error('Unexpected pg error', err);
    process.exit(-1);
});

const query = (text, params) => pool.query(text, params);

const getClient =  () =>  pool.connect();

export { query, getClient };

