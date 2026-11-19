

const PG_ERROR_MAP = {
    '23505': { status: 409, message: 'Resource already exists' },
    '23503': { status: 409, message: 'Referenced resource does not exist' },
    '23502': { status: 400, message: 'Missing required field' },
    '23514': { status: 400, message: 'Value failed validation' },
    '40001': { status: 503, message: 'Service temporarily unavailable, retry' },
    '40P01': { status: 503, message: 'Service temporarily unavailable, retry' },
    'ECONNREFUSED': { status: 503, message: 'Service temporarily unavailable' },
    'ETIMEDOUT': { status: 503, message: 'Service temporarily unavailable' }
    // 42xxx (syntax, undefined table/column) — these are BUGS.
    // Never map them to a client-facing message. Treat as 500.
};

export default function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON body' });
    }
    let status = 500;

    if (err.isAppError) {
        status = err.status;
    } else if (PG_ERROR_MAP[err.code]) {
        status = PG_ERROR_MAP[err.code].status;
    }

    if (status >= 500) {
        console.error({
            message: err.message,
            httpStatus: status,
            errorCode: err.code || 'N/A',
            stack: err.stack,
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString(),
        });
    }


    let responseMessage = 'Internal server error';

    if (err.isAppError) {
        responseMessage = err.message;
    }
    else if (PG_ERROR_MAP[err.code]) {
        responseMessage = PG_ERROR_MAP[err.code].message;
    }

    return res.status(status).json({ error: responseMessage });

}