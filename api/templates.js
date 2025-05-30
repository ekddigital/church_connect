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

async function handleGetTemplates(req, res) {
    try {
        const currentUser = await getUserFromToken(req);
        
        // Placeholder for templates - implement based on your schema
        const templates = [];

        return success(res, 'Templates retrieved successfully', { templates });
    } catch (err) {
        console.error('Get templates error:', err);
        return error(res, 'Failed to retrieve templates', 500);
    }
}

async function handler(req, res) {
    return handleCors(req, res, asyncHandler(async (req, res) => {
        const { method } = req;
        
        switch (method) {
            case 'GET':
                return handleGetTemplates(req, res);
            default:
                return error(res, 'Method not allowed', 405);
        }
    }));
}

module.exports = handler;
