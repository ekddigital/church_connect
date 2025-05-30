const { query } = require('./_lib/database');
const { verifyToken } = require('./_lib/auth');
const { handleCors, success, error, validationError, asyncHandler } = require('./_lib/response');

async function getUserFromToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No valid authorization token');
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    const users = await query(
        'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL',
        [decoded.userId]
    );

    if (users.length === 0) {
        throw new Error('User not found');
    }

    return users[0];
}

async function handleGetAutomation(req, res) {
    try {
        const currentUser = await getUserFromToken(req);
        
        // Placeholder for automation - implement based on your schema
        const automation = [];

        return success(res, 'Automation retrieved successfully', { automation });
    } catch (err) {
        console.error('Get automation error:', err);
        return error(res, 'Failed to retrieve automation', 500);
    }
}

async function handler(req, res) {
    return handleCors(req, res, asyncHandler(async (req, res) => {
        const { method } = req;
        
        switch (method) {
            case 'GET':
                return handleGetAutomation(req, res);
            default:
                return error(res, 'Method not allowed', 405);
        }
    }));
}

module.exports = handler;
