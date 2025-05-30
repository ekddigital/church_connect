// Standard API response utilities

// CORS headers for cross-origin requests
function setCorsHeaders(res) {
    const origin = process.env.CORS_ORIGIN || 'http://localhost:3000';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
}

// Handle CORS preflight requests
function handleCors(req, res, handler) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    return handler(req, res);
}

// Success response
function success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
}

// Error response
function error(res, message = 'Internal Server Error', statusCode = 500, details = null) {
    console.error(`API Error [${statusCode}]:`, message, details);

    return res.status(statusCode).json({
        success: false,
        error: message,
        details: process.env.NODE_ENV === 'development' ? details : undefined,
        timestamp: new Date().toISOString()
    });
}

// Validation error
function validationError(res, errors) {
    return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
        timestamp: new Date().toISOString()
    });
}

// Not found error
function notFound(res, resource = 'Resource') {
    return error(res, `${resource} not found`, 404);
}

// Unauthorized error
function unauthorized(res, message = 'Unauthorized') {
    return error(res, message, 401);
}

// Forbidden error
function forbidden(res, message = 'Forbidden') {
    return error(res, message, 403);
}

// Handle async errors
function asyncHandler(handler) {
    return async (req, res) => {
        try {
            await handler(req, res);
        } catch (err) {
            console.error('Async handler error:', err);

            // Handle specific error types
            if (err.name === 'ValidationError') {
                return validationError(res, err.details);
            }

            if (err.message.includes('not found')) {
                return notFound(res);
            }

            if (err.message.includes('unauthorized') || err.message.includes('Invalid token')) {
                return unauthorized(res, err.message);
            }

            if (err.message.includes('forbidden') || err.message.includes('permission')) {
                return forbidden(res, err.message);
            }

            // Generic server error
            return error(res, err.message || 'Internal Server Error', 500, err.stack);
        }
    };
}

// Pagination helper
function paginate(page = 1, limit = 20) {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    return {
        limit: parseInt(limit),
        offset: offset,
        page: parseInt(page)
    };
}

// Format paginated response
function paginatedResponse(res, data, total, page, limit, message = 'Success') {
    const totalPages = Math.ceil(total / limit);

    return success(res, {
        items: data,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: parseInt(total),
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    }, message);
}

module.exports = {
    setCorsHeaders,
    handleCors,
    success,
    error,
    validationError,
    notFound,
    unauthorized,
    forbidden,
    asyncHandler,
    paginate,
    paginatedResponse
};
