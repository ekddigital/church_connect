const bcrypt = require('bcryptjs');
const { createConnection } = require('../_lib/database');
const { generateToken } = require('../_lib/auth');
const { apiResponse, apiError } = require('../_lib/response');

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return apiError(res, 'Method not allowed', 405);
    }

    const { email, password, displayName, organizationId, role = 'member' } = req.body;

    // Validation
    if (!email || !password || !displayName) {
        return apiError(res, 'Email, password, and display name are required', 400);
    }

    if (password.length < 6) {
        return apiError(res, 'Password must be at least 6 characters long', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return apiError(res, 'Invalid email format', 400);
    }

    const connection = await createConnection();

    try {
        // Check if user already exists
        const [existingUsers] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [email.toLowerCase()]
        );

        if (existingUsers.length > 0) {
            return apiError(res, 'User with this email already exists', 409);
        }

        // Validate organization if provided
        if (organizationId) {
            const [organizations] = await connection.execute(
                'SELECT id FROM organizations WHERE id = ?',
                [organizationId]
            );

            if (organizations.length === 0) {
                return apiError(res, 'Invalid organization ID', 400);
            }
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const userId = require('crypto').randomUUID();
        const [result] = await connection.execute(
            `INSERT INTO users (id, email, password_hash, display_name, role, organization_id, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, email.toLowerCase(), passwordHash, displayName, role, organizationId, true]
        );

        // Generate JWT token
        const token = generateToken({
            userId,
            email: email.toLowerCase(),
            displayName,
            role,
            organizationId
        });

        // Get complete user data for response
        const [newUser] = await connection.execute(
            `SELECT u.id, u.email, u.display_name, u.role, u.organization_id, u.is_active, 
                    u.created_at, o.name as organization_name
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
            message: 'User registered successfully',
            user: userData,
            token
        }, 201);

    } catch (error) {
        console.error('Registration error:', error);
        return apiError(res, 'Internal server error during registration', 500);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
