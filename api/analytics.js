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

async function handleGetAnalytics(req, res) {
    try {
        const currentUser = await getUserFromToken(req);
        
        // Placeholder analytics data
        const analytics = {
            totalUsers: 0,
            totalMessages: 0,
            totalTemplates: 0,
            recentActivity: []
        };

        return success(res, 'Analytics retrieved successfully', analytics);
    } catch (err) {
        console.error('Get analytics error:', err);
        return error(res, 'Failed to retrieve analytics', 500);
    }
}

async function handler(req, res) {
    return handleCors(req, res, asyncHandler(async (req, res) => {
        const { method } = req;
        
        switch (method) {
            case 'GET':
                return handleGetAnalytics(req, res);
            default:
                return error(res, 'Method not allowed', 405);
        }
    }));
}

module.exports = handler;
