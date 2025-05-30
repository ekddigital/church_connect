const { query } = require('./_lib/database');
const { hashPassword, comparePassword, generateToken } = require('./_lib/auth');
const { handleCors, success, error, validationError, asyncHandler } = require('./_lib/response');
const Joi = require('joi');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID || '85337381939-h6g4dg1vctcjnda3ni2s398ff1jmams5.apps.googleusercontent.com'
);

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

const googleAuthSchema = Joi.object({
    token: Joi.string().required()
});

const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required()
});

async function handleLogin(req, res) {
    const { error: validationErr, value } = loginSchema.validate(req.body);
    if (validationErr) {
        return validationError(res, validationErr.details[0].message);
    }

    const { email, password } = value;

    try {
        // Get user from database
        const users = await query(
            'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL',
            [email]
        );

        if (users.length === 0) {
            return error(res, 'Invalid email or password', 401);
        }

        const user = users[0];

        // Check password
        const isValidPassword = await comparePassword(password, user.password_hash);
        if (!isValidPassword) {
            return error(res, 'Invalid email or password', 401);
        }

        // Generate token
        const token = generateToken({ userId: user.id, email: user.email, role: user.role });

        // Update last login
        await query(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [user.id]
        );

        return success(res, 'Login successful', {
            token,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.display_name,
                role: user.role,
                organizationId: user.organization_id
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return error(res, 'Login failed', 500);
    }
}

async function handleRegister(req, res) {
    const { error: validationErr, value } = registerSchema.validate(req.body);
    if (validationErr) {
        return validationError(res, validationErr.details[0].message);
    }

    const { email, password, displayName, organizationName, role } = value;

    try {
        // Check if user already exists
        const existingUsers = await query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return error(res, 'User with this email already exists', 400);
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create organization first
        const orgResult = await query(
            'INSERT INTO organizations (name, type, created_at) VALUES (?, ?, NOW())',
            [organizationName, 'church']
        );

        const organizationId = orgResult.insertId;

        // Create user
        const userResult = await query(
            'INSERT INTO users (email, password_hash, display_name, role, organization_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [email, passwordHash, displayName, role, organizationId]
        );

        const userId = userResult.insertId;

        // Generate token
        const token = generateToken({ userId, email, role });

        return success(res, 'Registration successful', {
            token,
            user: {
                id: userId,
                email,
                displayName,
                role,
                organizationId
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        return error(res, 'Registration failed', 500);
    }
}

async function handleGoogleAuth(req, res) {
    const { error: validationErr, value } = googleAuthSchema.validate(req.body);
    if (validationErr) {
        return validationError(res, validationErr.details[0].message);
    }

    const { token } = value;

    try {
        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID || '85337381939-h6g4dg1vctcjnda3ni2s398ff1jmams5.apps.googleusercontent.com'
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        if (!email) {
            return error(res, 'Unable to get email from Google token', 400);
        }

        // Check if user exists
        let user;
        const existingUsers = await query(
            'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL',
            [email]
        );

        if (existingUsers.length > 0) {
            user = existingUsers[0];
            
            // Update last login and Google info
            await query(
                'UPDATE users SET last_login = NOW(), google_id = ?, avatar_url = ? WHERE id = ?',
                [payload.sub, picture, user.id]
            );
        } else {
            // Create new user with Google account
            const orgResult = await query(
                'INSERT INTO organizations (name, type, created_at) VALUES (?, ?, NOW())',
                [name + "'s Organization", 'church']
            );

            const organizationId = orgResult.insertId;

            const userResult = await query(
                'INSERT INTO users (email, display_name, role, organization_id, google_id, avatar_url, created_at, last_login) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
                [email, name, 'admin', organizationId, payload.sub, picture]
            );

            user = {
                id: userResult.insertId,
                email,
                display_name: name,
                role: 'admin',
                organization_id: organizationId,
                google_id: payload.sub,
                avatar_url: picture
            };
        }

        // Generate JWT token
        const jwtToken = generateToken({ 
            userId: user.id, 
            email: user.email, 
            role: user.role 
        });

        return success(res, 'Google authentication successful', {
            token: jwtToken,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.display_name,
                role: user.role,
                organizationId: user.organization_id,
                avatarUrl: user.avatar_url
            }
        });
    } catch (err) {
        console.error('Google auth error:', err);
        return error(res, 'Google authentication failed', 500);
    }
}

async function handleResetPassword(req, res) {
    const { error: validationErr, value } = resetPasswordSchema.validate(req.body);
    if (validationErr) {
        return validationError(res, validationErr.details[0].message);
    }

    const { email } = value;

    try {
        // Check if user exists
        const users = await query(
            'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL',
            [email]
        );

        if (users.length === 0) {
            // Don't reveal that user doesn't exist
            return success(res, 'If an account with that email exists, a password reset link has been sent');
        }

        // TODO: Implement actual email sending
        // For now, just return success
        return success(res, 'Password reset link has been sent to your email');
    } catch (err) {
        console.error('Reset password error:', err);
        return error(res, 'Password reset failed', 500);
    }
}

async function handler(req, res) {
    return handleCors(req, res, asyncHandler(async (req, res) => {
        const { method, url } = req;
        
        // Parse the route
        const path = url.split('?')[0];
        const route = path.split('/').pop();

        switch (method) {
            case 'POST':
                switch (route) {
                    case 'login':
                        return handleLogin(req, res);
                    case 'register':
                        return handleRegister(req, res);
                    case 'google':
                        return handleGoogleAuth(req, res);
                    case 'reset-password':
                        return handleResetPassword(req, res);
                    default:
                        return error(res, 'Endpoint not found', 404);
                }
            default:
                return error(res, 'Method not allowed', 405);
        }
    }));
}

module.exports = handler;
