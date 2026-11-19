import { AppError } from '../utils/AppError.js';
import { decodeKeysetCursor } from '../utils/keysetCursor.js';

export const MAX_PASSWORD_LENGTH = 128;

export const assertAllowedProperties = (value, allowedProperties) => {
    for (const property of Object.keys(value)) {
        if (!allowedProperties.includes(property)) {
            throw new AppError(`Unsupported request property: ${property}`, 400);
        }
    }
};

export const validateEmailAddress = (email) => {
    const normalizedEmail = email.trim();
    if (
        normalizedEmail.length > 100 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
        throw new AppError('Valid email is required', 400);
    }
};

export const validateProduct = (req, res, next) => {
    
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        throw new AppError('Request body must be a JSON object', 400);
    }
    assertAllowedProperties(req.body, ['name', 'price', 'stock']);
    const { name, price, stock } = req.body;
    const priceText = typeof price === 'number' && Number.isFinite(price)
        ? String(price)
        : '';
    if (
        typeof name !== 'string' ||
        name.trim() === '' ||
        !/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(priceText) ||
        price <= 0 ||
        price > 99999999.99 ||
        !Number.isInteger(stock) ||
        stock < 0 ||
        stock > 2147483647
    ) {
        throw new AppError(
            'name, price between 0 and 99999999.99 with at most two decimal places, and valid stock are required',
            400
        );
    }
    next();
}

export const validateId = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (!/^[1-9]\d*$/.test(id)) {
            throw new AppError(`Invalid ${paramName}`, 400);
        }
        next();
    };
};

const parseListQuery = (query, allowedFilters, filterParsers) => {
    const allowedParams = new Set(['cursor', 'limit', ...allowedFilters]);
    for (const key of Object.keys(query)) {
        if (!allowedParams.has(key)) {
            throw new AppError(`Unsupported query parameter: ${key}`, 400);
        }
        if (Array.isArray(query[key]) || typeof query[key] !== 'string') {
            throw new AppError(`Invalid ${key} query parameter`, 400);
        }
    }

    const parseInteger = (value, name, defaultValue, maximum = Number.MAX_SAFE_INTEGER) => {
        if (value === undefined) {
            return defaultValue;
        }
        if (!/^(0|[1-9]\d*)$/.test(value)) {
            throw new AppError(`${name} must be a non-negative integer`, 400);
        }
        const parsed = Number(value);
        if (!Number.isSafeInteger(parsed) || parsed > maximum) {
            throw new AppError(`${name} is out of range`, 400);
        }
        return parsed;
    };

    const limit = parseInteger(query.limit, 'limit', 20, 100);
    if (limit < 1) {
        throw new AppError('limit must be between 1 and 100', 400);
    }

    const filters = {};
    for (const [name, parser] of Object.entries(filterParsers)) {
        if (query[name] !== undefined) {
            filters[name] = parser(query[name], name);
        }
    }

    const cursor = query.cursor === undefined
        ? null
        : decodeKeysetCursor(query.cursor);
    return { cursor, limit, filters };
};

const parseDecimalFilter = (value, name) => {
    if (!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(value)) {
        throw new AppError(`${name} must be a non-negative decimal with at most two places`, 400);
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed > 99999999.99) {
        throw new AppError(`${name} is out of range`, 400);
    }
    return value;
};

const parseStockFilter = (value, name) => {
    if (!/^(0|[1-9]\d*)$/.test(value) || Number(value) > 2147483647) {
        throw new AppError(`${name} must be a non-negative integer`, 400);
    }
    return Number(value);
};

export const validateProductListQuery = (req, res, next) => {
    const parsed = parseListQuery(
        req.query,
        ['q', 'minPrice', 'maxPrice', 'minStock', 'maxStock', 'inStock'],
        {
            q: (value) => {
                if (!value.trim() || value.length > 100) {
                    throw new AppError('q must contain 1 to 100 characters', 400);
                }
                return value.trim();
            },
            minPrice: parseDecimalFilter,
            maxPrice: parseDecimalFilter,
            minStock: parseStockFilter,
            maxStock: parseStockFilter,
            inStock: (value) => {
                if (value !== 'true' && value !== 'false') {
                    throw new AppError('inStock must be true or false', 400);
                }
                return value === 'true';
            },
        }
    );
    if (
        parsed.filters.minPrice !== undefined &&
        parsed.filters.maxPrice !== undefined &&
        Number(parsed.filters.minPrice) > Number(parsed.filters.maxPrice)
    ) {
        throw new AppError('minPrice cannot exceed maxPrice', 400);
    }
    if (
        parsed.filters.minStock !== undefined &&
        parsed.filters.maxStock !== undefined &&
        parsed.filters.minStock > parsed.filters.maxStock
    ) {
        throw new AppError('minStock cannot exceed maxStock', 400);
    }
    req.listQuery = parsed;
    next();
};

export const validateOrderListQuery = (req, res, next) => {
    const parsed = parseListQuery(req.query, ['status', 'userId'], {
        status: (value, name) => {
            if (!['pending', 'completed', 'cancelled'].includes(value)) {
                throw new AppError(`${name} must be pending, completed, or cancelled`, 400);
            }
            return value;
        },
        userId: (value, name) => {
            if (!/^[1-9]\d*$/.test(value) || Number(value) > 2147483647) {
                throw new AppError(`${name} must be a valid user ID`, 400);
            }
            return Number(value);
        },
    });
    req.listQuery = parsed;
    next();
};

export const validateBalanceIncrease = (req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        throw new AppError('Request body must be a JSON object', 400);
    }

    assertAllowedProperties(req.body, ['amount']);
    const { amount } = req.body;
    const amountText = typeof amount === 'number' ? String(amount) : '';
    if (
        !/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(amountText) ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        amount > 9999999999.99
    ) {
        throw new AppError(
            'amount must be a positive number with at most two decimal places',
            400
        );
    }

    req.body.amount = amount.toFixed(2);
    next();
};

export const validateOrder = (req, res, next) => {
    const maxInteger = 2147483647;

    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        throw new AppError('Request body must be a JSON object', 400);
    }

    assertAllowedProperties(req.body, ['data']);
    const { data } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
        throw new AppError('Order data is required and must be a non-empty array', 400);
    }

    for (const item of data) {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
            throw new AppError('Each order item must be an object', 400);
        }
        assertAllowedProperties(item, ['product_id', 'quantity']);
        const productId = typeof item.product_id === 'string' &&
            /^[1-9]\d*$/.test(item.product_id)
            ? Number(item.product_id)
            : item.product_id;
        if (!Number.isSafeInteger(productId) || productId <= 0 || productId > maxInteger ||
            !Number.isSafeInteger(item.quantity) || item.quantity <= 0 ||
            item.quantity > maxInteger) {
            throw new AppError('Each item must have a valid product_id and a positive quantity', 400);
        }
        item.product_id = productId;
    }
    next();
}

export const validateLogin = (req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        throw new AppError('Request body must be a JSON object', 400);
    }
    assertAllowedProperties(req.body, ['email', 'password']);
    const { email, password } = req.body;
    if (typeof email !== 'string' || email.trim() === '' ||
        typeof password !== 'string' || password.trim() === '' ||
        password.length > MAX_PASSWORD_LENGTH) {
        throw new AppError('email and password are required', 400);
    }
    validateEmailAddress(email);
    next();
}

export const validateRegister = (req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        throw new AppError('Request body must be a JSON object', 400);
    }
    assertAllowedProperties(req.body, ['name', 'email', 'password']);
    const { name, email, password } = req.body;
    if (typeof name !== 'string' || name.trim() === '' ||
        name.trim().length > 100 ||
        typeof email !== 'string' || email.trim() === '' ||
        typeof password !== 'string' || password.trim() === '' ||
        password.length < 8 || password.length > MAX_PASSWORD_LENGTH) {
        throw new AppError('name, email and password are required', 400);
    }
    validateEmailAddress(email);
    next();
}