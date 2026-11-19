
import dotenv from 'dotenv';

dotenv.config();

const requiredVariables = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASSWORD',
    'EMAIL_FROM',
    'FRONTEND_URL'
];

for (const name of requiredVariables) {
    if (!process.env[name]?.trim()) {
        console.error(`Missing required environment variable: ${name}`);
        process.exit(1);
    }
}

const parsePort = (name, defaultValue) => {
    const value = process.env[name];

    // Use the default only when the variable is absent.
    if (value === undefined) {
        return defaultValue;
    }

    // Reject empty strings and values that aren't decimal digits.
    if (!/^\d+$/.test(value)) {
        console.error(`Invalid environment variable: ${name}`);
        process.exit(1);
    }

    const port = Number(value);

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        console.error(`Invalid environment variable: ${name}`);
        process.exit(1);
    }

    return port;
};

const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',

    PORT: parsePort('PORT', 3000),

    DB_HOST: process.env.DB_HOST.trim(),
    DB_PORT: parsePort('DB_PORT', 5432),
    DB_USER: process.env.DB_USER.trim(),
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME.trim(),
    JWT_SECRET: process.env.JWT_SECRET.trim(),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN.trim(),
    SMTP_HOST: process.env.SMTP_HOST.trim(),
    SMTP_PORT: parsePort('SMTP_PORT'),
    SMTP_USER: process.env.SMTP_USER.trim(),
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM.trim(),
    FRONTEND_URL: process.env.FRONTEND_URL.trim()
};

export default Object.freeze(env);
