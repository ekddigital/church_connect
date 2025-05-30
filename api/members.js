const { query } = require('./_lib/database');
const { verifyToken } = require('./_lib/auth');
const { handleCors, success, error, validationError, asyncHandler } = require('./_lib/response');
const Joi = require('joi');

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

async function handleGetMembers(req, res) {
    try {
        const currentUser = await getUserFromToken(req);
        
        const members = await query(`
            SELECT 
                id,
                email,
                display_name,
                role,
                created_at,
                last_login
            FROM users 
            WHERE organization_id = ? AND deleted_at IS NULL
            ORDER BY display_name ASC
        `, [currentUser.organization_id]);

        return success(res, 'Members retrieved successfully', { members });
    } catch (err) {
        console.error('Get members error:', err);
        return error(res, 'Failed to retrieve members', 500);
    }
}

async function handler(req, res) {
    return handleCors(req, res, asyncHandler(async (req, res) => {
        const { method } = req;
        
        switch (method) {
            case 'GET':
                return handleGetMembers(req, res);
            default:
                return error(res, 'Method not allowed', 405);
        }
    }));
}

module.exports = handler;
