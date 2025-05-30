const { createConnection } = require('../_lib/database');
const { verifyToken, hasPermission } = require('../_lib/auth');
const { apiResponse, apiError } = require('../_lib/response');

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Verify authentication
    const authResult = verifyToken(req);
    if (!authResult.success) {
        return apiError(res, authResult.error, 401);
    }

    const currentUser = authResult.user;
    const connection = await createConnection();

    try {
        switch (req.method) {
            case 'GET':
                return await getUsers(req, res, connection, currentUser);
            case 'POST':
                return await createUser(req, res, connection, currentUser);
            case 'PUT':
                return await updateUser(req, res, connection, currentUser);
            case 'DELETE':
                return await deleteUser(req, res, connection, currentUser);
            default:
                return apiError(res, 'Method not allowed', 405);
        }
    } catch (error) {
        console.error('Users API error:', error);
        return apiError(res, 'Internal server error', 500);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Handle user role updates
async function handleRoleUpdate(req, res, connection, currentUser) {
    const { userId } = req.query;
    const { role } = req.body;

    // Only super admins can update user roles
    if (currentUser.role !== 'super_admin') {
        return apiError(res, 'Only super admins can update user roles', 403);
    }

    if (!userId || !role) {
        return apiError(res, 'User ID and role are required', 400);
    }

    const validRoles = ['super_admin', 'admin', 'ministry_leader', 'volunteer', 'member'];
    if (!validRoles.includes(role)) {
        return apiError(res, 'Invalid role', 400);
    }

    try {
        // Update user role
        const [result] = await connection.execute(
            'UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?',
            [role, userId]
        );

        if (result.affectedRows === 0) {
            return apiError(res, 'User not found', 404);
        }

        // Get updated user
        const [users] = await connection.execute(
            'SELECT u.*, o.name as organization_name FROM users u LEFT JOIN organizations o ON u.organization_id = o.id WHERE u.id = ?',
            [userId]
        );

        const user = users[0];
        if (!user) {
            return apiError(res, 'User not found', 404);
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
            organizationName: user.organization_name,
            isActive: user.is_active,
            lastLogin: user.last_login,
            createdAt: user.created_at,
            updatedAt: user.updated_at
        };

        return apiResponse(res, {
            message: 'User role updated successfully',
            user: userResponse
        });

    } catch (error) {
        console.error('Role update error:', error);
        return apiError(res, 'Failed to update user role', 500);
    }
}

async function getUsers(req, res, connection, currentUser) {
    // Check permissions
    if (!hasPermission(currentUser.role, ['admin', 'pastor', 'leader'])) {
        return apiError(res, 'Insufficient permissions', 403);
    }

    const { page = 1, limit = 20, search, role, organizationId } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    // Filter by organization for non-admin users
    if (currentUser.role !== 'admin' && currentUser.organizationId) {
        whereClause += ' AND u.organization_id = ?';
        params.push(currentUser.organizationId);
    } else if (organizationId) {
        whereClause += ' AND u.organization_id = ?';
        params.push(organizationId);
    }

    // Search filter
    if (search) {
        whereClause += ' AND (u.display_name LIKE ? OR u.email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    // Role filter
    if (role) {
        whereClause += ' AND u.role = ?';
        params.push(role);
    }

    // Get total count
    const [countResult] = await connection.execute(
        `SELECT COUNT(*) as total FROM users u ${whereClause}`,
        params
    );
    const total = countResult[0].total;

    // Get users with pagination
    const [users] = await connection.execute(
        `SELECT u.id, u.email, u.display_name, u.role, u.organization_id, 
                u.is_active, u.last_login, u.created_at, u.updated_at,
                o.name as organization_name
         FROM users u
         LEFT JOIN organizations o ON u.organization_id = o.id
         ${whereClause}
         ORDER BY u.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), offset]
    );

    const userData = users.map(user => ({
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
        organizationId: user.organization_id,
        organizationName: user.organization_name,
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at
    }));

    return apiResponse(res, {
        users: userData,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
}

async function createUser(req, res, connection, currentUser) {
    // Only admins and pastors can create users
    if (!hasPermission(currentUser.role, ['admin', 'pastor'])) {
        return apiError(res, 'Insufficient permissions', 403);
    }

    const { email, password, displayName, role = 'member', organizationId } = req.body;

    if (!email || !password || !displayName) {
        return apiError(res, 'Email, password, and display name are required', 400);
    }

    // For non-admin users, restrict organization
    const targetOrgId = currentUser.role === 'admin' ? organizationId : currentUser.organizationId;

    // Check if user exists
    const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email.toLowerCase()]
    );

    if (existingUsers.length > 0) {
        return apiError(res, 'User with this email already exists', 409);
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const userId = require('crypto').randomUUID();
    await connection.execute(
        `INSERT INTO users (id, email, password_hash, display_name, role, organization_id, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, email.toLowerCase(), passwordHash, displayName, role, targetOrgId, true]
    );

    // Get created user data
    const [newUser] = await connection.execute(
        `SELECT u.id, u.email, u.display_name, u.role, u.organization_id, 
                u.is_active, u.created_at, o.name as organization_name
         FROM users u
         LEFT JOIN organizations o ON u.organization_id = o.id
         WHERE u.id = ?`,
        [userId]
    );

    const userData = {
        id: newUser[0].id,
        email: newUser[0].email,
        displayName: newUser[0].display_name,
        role: newUser[0].role,
        organizationId: newUser[0].organization_id,
        organizationName: newUser[0].organization_name,
        isActive: newUser[0].is_active,
        createdAt: newUser[0].created_at
    };

    return apiResponse(res, {
        message: 'User created successfully',
        user: userData
    }, 201);
}

async function updateUser(req, res, connection, currentUser) {
    const { id } = req.query;
    const { displayName, role, isActive, organizationId } = req.body;

    if (!id) {
        return apiError(res, 'User ID is required', 400);
    }

    // Get target user
    const [targetUsers] = await connection.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
    );

    if (targetUsers.length === 0) {
        return apiError(res, 'User not found', 404);
    }

    const targetUser = targetUsers[0];

    // Permission checks
    if (currentUser.userId !== id && !hasPermission(currentUser.role, ['admin', 'pastor'])) {
        return apiError(res, 'Insufficient permissions', 403);
    }

    // Non-admin users can only modify users in their organization
    if (currentUser.role !== 'admin' && targetUser.organization_id !== currentUser.organizationId) {
        return apiError(res, 'Cannot modify users from other organizations', 403);
    }

    // Build update query
    const updateFields = [];
    const params = [];

    if (displayName !== undefined) {
        updateFields.push('display_name = ?');
        params.push(displayName);
    }

    if (role !== undefined && hasPermission(currentUser.role, ['admin', 'pastor'])) {
        updateFields.push('role = ?');
        params.push(role);
    }

    if (isActive !== undefined && hasPermission(currentUser.role, ['admin', 'pastor'])) {
        updateFields.push('is_active = ?');
        params.push(isActive);
    }

    if (organizationId !== undefined && currentUser.role === 'admin') {
        updateFields.push('organization_id = ?');
        params.push(organizationId);
    }

    if (updateFields.length === 0) {
        return apiError(res, 'No valid fields to update', 400);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    // Update user
    await connection.execute(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        params
    );

    // Get updated user data
    const [updatedUser] = await connection.execute(
        `SELECT u.id, u.email, u.display_name, u.role, u.organization_id, 
                u.is_active, u.created_at, u.updated_at, o.name as organization_name
         FROM users u
         LEFT JOIN organizations o ON u.organization_id = o.id
         WHERE u.id = ?`,
        [id]
    );

    const userData = {
        id: updatedUser[0].id,
        email: updatedUser[0].email,
        displayName: updatedUser[0].display_name,
        role: updatedUser[0].role,
        organizationId: updatedUser[0].organization_id,
        organizationName: updatedUser[0].organization_name,
        isActive: updatedUser[0].is_active,
        createdAt: updatedUser[0].created_at,
        updatedAt: updatedUser[0].updated_at
    };

    return apiResponse(res, {
        message: 'User updated successfully',
        user: userData
    });
}

async function deleteUser(req, res, connection, currentUser) {
    // Only admins can delete users
    if (!hasPermission(currentUser.role, ['admin'])) {
        return apiError(res, 'Insufficient permissions', 403);
    }

    const { id } = req.query;

    if (!id) {
        return apiError(res, 'User ID is required', 400);
    }

    // Cannot delete self
    if (currentUser.userId === id) {
        return apiError(res, 'Cannot delete your own account', 400);
    }

    // Check if user exists
    const [users] = await connection.execute(
        'SELECT id FROM users WHERE id = ?',
        [id]
    );

    if (users.length === 0) {
        return apiError(res, 'User not found', 404);
    }

    // Delete user (cascade will handle related records)
    await connection.execute('DELETE FROM users WHERE id = ?', [id]);

    return apiResponse(res, {
        message: 'User deleted successfully'
    });
}
