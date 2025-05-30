const { query } = require('../_lib/database');
const { generateToken } = require('../_lib/auth');
const { handleCors, success, error, validationError, asyncHandler } = require('../_lib/response');
const Joi = require('joi');

// Role update validation schema
const roleUpdateSchema = Joi.object({
    role: Joi.string().valid('super_admin', 'admin', 'ministry_leader', 'volunteer', 'member').required()
});

async function handler(req, res) {
    return handleCors(req, res, asyncHandler(async (req, res) => {
        const { method } = req;
        const { userId } = req.query;

        switch (method) {
            case 'PUT':
                return await updateUserRole(req, res, userId);
            case 'GET':
                return await getAllUsers(req, res);
            case 'DELETE':
                return await deleteUser(req, res, userId);
            default:
                return error(res, 'Method not allowed', 405);
        }
    }));
}

async function updateUserRole(req, res, userId) {
    // Get current user from auth token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return error(res, 'Authorization token required', 401);
    }

    try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Only super admins can update roles
        if (decoded.role !== 'super_admin') {
            return error(res, 'Only super admins can update user roles', 403);
        }

        // Validate request body
        const { error: validationErr, value } = roleUpdateSchema.validate(req.body);
        if (validationErr) {
            return validationError(res, validationErr.details);
        }

        const { role } = value;

        if (!userId) {
            return error(res, 'User ID is required', 400);
        }

        // Update user role
        const result = await query(
            'UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?',
            [role, userId]
        );

        if (result.affectedRows === 0) {
            return error(res, 'User not found', 404);
        }

        // Get updated user
        const users = await query(
            'SELECT u.*, o.id as org_id, o.name as org_name FROM users u LEFT JOIN organizations o ON u.organization_id = o.id WHERE u.id = ?',
            [userId]
        );

        const user = users[0];
        if (!user) {
            return error(res, 'User not found', 404);
        }

        const userResponse = {
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            role: {
                name: user.role,
                permissions: getRolePermissions(user.role)
            },
            organizationId: user.organization_id,
            organizationName: user.org_name,
            isActive: user.is_active,
            lastLogin: user.last_login,
            createdAt: user.created_at,
            updatedAt: user.updated_at
        };

        return success(res, {
            message: 'User role updated successfully',
            user: userResponse
        });

    } catch (err) {
        console.error('Role update error:', err);
        return error(res, 'Failed to update user role', 500);
    }
}

async function getAllUsers(req, res) {
    // Get current user from auth token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return error(res, 'Authorization token required', 401);
    }

    try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Only admins and super admins can view all users
        if (!['admin', 'super_admin'].includes(decoded.role)) {
            return error(res, 'Insufficient permissions', 403);
        }

        // Get all users
        const users = await query(
            'SELECT u.*, o.id as org_id, o.name as org_name FROM users u LEFT JOIN organizations o ON u.organization_id = o.id ORDER BY u.created_at DESC'
        );

        const usersResponse = users.map(user => ({
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            role: {
                name: user.role,
                permissions: getRolePermissions(user.role)
            },
            organizationId: user.organization_id,
            organizationName: user.org_name,
            isActive: user.is_active,
            lastLogin: user.last_login,
            createdAt: user.created_at,
            updatedAt: user.updated_at
        }));

        return success(res, {
            users: usersResponse,
            total: users.length
        });

    } catch (err) {
        console.error('Get users error:', err);
        return error(res, 'Failed to get users', 500);
    }
}

async function deleteUser(req, res, userId) {
    // Get current user from auth token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return error(res, 'Authorization token required', 401);
    }

    try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Only super admins can delete users
        if (decoded.role !== 'super_admin') {
            return error(res, 'Only super admins can delete users', 403);
        }

        if (!userId) {
            return error(res, 'User ID is required', 400);
        }

        // Prevent deleting yourself
        if (decoded.userId === userId) {
            return error(res, 'Cannot delete your own account', 400);
        }

        // Delete user
        const result = await query(
            'DELETE FROM users WHERE id = ?',
            [userId]
        );

        if (result.affectedRows === 0) {
            return error(res, 'User not found', 404);
        }

        return success(res, {
            message: 'User deleted successfully'
        });

    } catch (err) {
        console.error('Delete user error:', err);
        return error(res, 'Failed to delete user', 500);
    }
}

function getRolePermissions(role) {
    const permissions = {
        super_admin: [
            'manage_super_admins',
            'manage_users',
            'manage_members',
            'send_messages',
            'view_analytics',
            'manage_templates',
            'manage_automation',
            'manage_organization',
            'export_data',
            'import_data',
            'system_settings',
            'audit_logs',
            'manage_subscriptions',
            'platform_admin'
        ],
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
            'manage_templates'
        ],
        volunteer: [
            'send_messages',
            'view_analytics'
        ],
        member: [
            'view_analytics'
        ]
    };

    return permissions[role] || [];
}

module.exports = handler;
