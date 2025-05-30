const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT utilities
function generateToken(payload, expiresIn = process.env.JWT_EXPIRES_IN || '24h') {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
}

// Password utilities
async function hashPassword(password) {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    return await bcrypt.hash(password, saltRounds);
}

async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

// Extract token from Authorization header
function extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No valid authorization header');
    }
    return authHeader.substring(7);
}

// Middleware to verify authentication
function requireAuth(handler) {
    return async (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            const token = extractTokenFromHeader(authHeader);
            const decoded = verifyToken(token);

            // Add user info to request
            req.user = decoded;

            return await handler(req, res);
        } catch (error) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: error.message
            });
        }
    };
}

// Check if user has specific permission
function hasPermission(userRole, permission) {
    const rolePermissions = {
        admin: [
            'manage_users',
            'manage_members',
            'send_messages',
            'view_analytics',
            'manage_templates',
            'manage_automation',
            'manage_organization',
            'export_data',
            'import_data'
        ],
        ministry_leader: [
            'manage_members',
            'send_messages',
            'view_analytics',
            'manage_templates',
            'create_automation',
            'export_data'
        ],
        volunteer: [
            'view_members',
            'send_messages',
            'create_templates'
        ],
        member: [
            'view_profile',
            'update_profile'
        ]
    };

    return rolePermissions[userRole]?.includes(permission) || false;
}

// Middleware to require specific permission
function requirePermission(permission) {
    return (handler) => requireAuth(async (req, res) => {
        if (!hasPermission(req.user.role, permission)) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions',
                required: permission
            });
        }
        return await handler(req, res);
    });
}

module.exports = {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    extractTokenFromHeader,
    requireAuth,
    requirePermission,
    hasPermission
};
