const { query } = require('../_lib/database');
const { hashPassword, comparePassword, generateToken } = require('../_lib/auth');
const { handleCors, success, error, validationError, asyncHandler } = require('../_lib/response');
const Joi = require('joi');

// Validation schemas
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    displayName: Joi.string().min(2).max(100).required(),
    organizationName: Joi.string().min(2).max(100).required(),
    role: Joi.string().valid('admin', 'ministry_leader', 'volunteer', 'member').default('admin')
});

async function handler(req, res) {
    return handleCors(req, res, asyncHandler(async (req, res) => {
        const { method } = req;

        switch (method) {
            case 'POST':
                return await handleLogin(req, res);
            default:
                return error(res, 'Method not allowed', 405);
        }
    }));
}

async function handleLogin(req, res) {
    // Validate request body
    const { error: validationErr, value } = loginSchema.validate(req.body);
    if (validationErr) {
        return validationError(res, validationErr.details);
    }

    const { email, password } = value;

    try {
        // Find user in database
        const users = await query(
            'SELECT * FROM users WHERE email = ? AND is_active = 1',
            [email]
        );

        if (users.length === 0) {
            return error(res, 'Invalid credentials', 401);
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await comparePassword(password, user.password_hash);
        if (!isValidPassword) {
            return error(res, 'Invalid credentials', 401);
        }

        // Update last login
        await query(
            'UPDATE users SET last_login_at = NOW() WHERE id = ?',
            [user.id]
        );

        // Generate JWT token
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organization_id
        });

        // Get organization info
        const organizations = await query(
            'SELECT * FROM organizations WHERE id = ?',
            [user.organization_id]
        );

        // Return user data (excluding password)
        const { password_hash, ...userData } = user;

        return success(res, {
            user: {
                ...userData,
                displayName: user.display_name,
                photoUrl: user.photo_url,
                phoneNumber: user.phone_number,
                organizationId: user.organization_id,
                isActive: user.is_active,
                createdAt: user.created_at,
                lastLoginAt: user.last_login_at
            },
            organization: organizations[0] || null,
            token
        }, 'Login successful');

    } catch (err) {
        console.error('Login error:', err);
        return error(res, 'Login failed', 500);
    }
}

module.exports = handler;
