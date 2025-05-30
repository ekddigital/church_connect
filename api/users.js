const { query } = require('./_lib/database');
const { verifyToken } = require('./_lib/auth');
const { handleCors, success, error, validationError, asyncHandler } = require('./_lib/response');
const Joi = require('joi');

// Validation schemas
const updateRoleSchema = Joi.object({
    role: Joi.string().valid('super_admin', 'admin', 'ministry_leader', 'volunteer', 'member').required()
});

// Permission check middleware
function requireSuperAdmin(user) {
    return user.role === 'super_admin';
}

function requireAdmin(user) {
    return ['super_admin', 'admin'].includes(user.role);
}

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

async function handleGetUsers(req, res) {
    try {
        const currentUser = await getUserFromToken(req);
        
        if (!requireAdmin(currentUser)) {
            return error(res, 'Insufficient permissions', 403);
        }

        const users = await query(`
            SELECT 
                u.id,
                u.email,
                u.display_name,
                u.role,
                u.organization_id,
                u.avatar_url,
                u.created_at,
                u.last_login,
                o.name as organization_name
            FROM users u
            LEFT JOIN organizations o ON u.organization_id = o.id
            WHERE u.deleted_at IS NULL
            ORDER BY u.created_at DESC
        `);

        return success(res, 'Users retrieved successfully', { users });
    } catch (err) {
        console.error('Get users error:', err);
        return error(res, 'Failed to retrieve users', 500);
    }
}

async function handleUpdateUserRole(req, res) {
    try {
        const currentUser = await getUserFromToken(req);
        
        if (!requireSuperAdmin(currentUser)) {
            return error(res, 'Only super admins can update user roles', 403);
        }

        const userId = req.url.split('/')[2]; // Extract userId from path
        const { error: validationErr, value } = updateRoleSchema.validate(req.body);
        
        if (validationErr) {
            return validationError(res, validationErr.details[0].message);
        }

        const { role } = value;

        // Check if target user exists
        const targetUsers = await query(
            'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL',
            [userId]
        );

        if (targetUsers.length === 0) {
            return error(res, 'User not found', 404);
        }

        // Update user role
        await query(
            'UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?',
            [role, userId]
        );

        return success(res, 'User role updated successfully');
    } catch (err) {
        console.error('Update user role error:', err);
        return error(res, 'Failed to update user role', 500);
    }
}

async function handleDeleteUser(req, res) {
    try {
        const currentUser = await getUserFromToken(req);
        
        if (!requireSuperAdmin(currentUser)) {
            return error(res, 'Only super admins can delete users', 403);
        }

        const userId = req.url.split('/')[2]; // Extract userId from path

        // Check if target user exists
        const targetUsers = await query(
            'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL',
            [userId]
        );

        if (targetUsers.length === 0) {
            return error(res, 'User not found', 404);
        }

        // Prevent deleting self
        if (currentUser.id === parseInt(userId)) {
            return error(res, 'Cannot delete your own account', 400);
        }

        // Soft delete user
        await query(
            'UPDATE users SET deleted_at = NOW() WHERE id = ?',
            [userId]
        );

        return success(res, 'User deleted successfully');
    } catch (err) {
        console.error('Delete user error:', err);
        return error(res, 'Failed to delete user', 500);
    }
}

async function handleGetRoles(req, res) {
    try {
        const currentUser = await getUserFromToken(req);
        
        if (!requireAdmin(currentUser)) {
            return error(res, 'Insufficient permissions', 403);
        }

        const roles = [
            {
                id: 'member',
                name: 'Member',
                description: 'Basic member access',
                permissions: ['view_profile', 'update_profile']
            },
            {
                id: 'volunteer',
                name: 'Volunteer',
                description: 'Volunteer with limited messaging',
                permissions: ['view_profile', 'update_profile', 'send_messages', 'view_members']
            },
            {
                id: 'ministry_leader',
                name: 'Ministry Leader',
                description: 'Lead ministry activities',
                permissions: ['view_profile', 'update_profile', 'send_messages', 'view_members', 'manage_members', 'view_analytics']
            },
            {
                id: 'admin',
                name: 'Admin',
                description: 'Organization administrator',
                permissions: ['view_profile', 'update_profile', 'send_messages', 'view_members', 'manage_members', 'view_analytics', 'manage_templates', 'manage_automation', 'manage_organization']
            }
        ];

        // Only show super_admin role to super admins
        if (requireSuperAdmin(currentUser)) {
            roles.push({
                id: 'super_admin',
                name: 'Super Admin',
                description: 'Platform super administrator',
                permissions: ['manage_super_admins', 'manage_users', 'system_settings', 'audit_logs', 'platform_admin']
            });
        }

        return success(res, 'Roles retrieved successfully', { roles });
    } catch (err) {
        console.error('Get roles error:', err);
        return error(res, 'Failed to retrieve roles', 500);
    }
}

async function handler(req, res) {
    return handleCors(req, res, asyncHandler(async (req, res) => {
        const { method, url } = req;
        
        // Parse the route
        const pathParts = url.split('?')[0].split('/');
        
        switch (method) {
            case 'GET':
                if (pathParts.length === 2) {
                    // GET /users
                    return handleGetUsers(req, res);
                } else if (pathParts[2] === 'roles') {
                    // GET /users/roles
                    return handleGetRoles(req, res);
                }
                break;
            case 'PUT':
                if (pathParts.length === 4 && pathParts[3] === 'role') {
                    // PUT /users/:id/role
                    return handleUpdateUserRole(req, res);
                }
                break;
            case 'DELETE':
                if (pathParts.length === 3) {
                    // DELETE /users/:id
                    return handleDeleteUser(req, res);
                }
                break;
        }
        
        return error(res, 'Endpoint not found', 404);
    }));
}

module.exports = handler;
