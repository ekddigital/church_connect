const { query } = require('../_lib/database');
const { generateToken } = require('../_lib/auth');
const { handleCors, success, error, validationError, asyncHandler } = require('../_lib/response');
const Joi = require('joi');

// Google OAuth validation schema
const googleAuthSchema = Joi.object({
    idToken: Joi.string().required(),
    accessToken: Joi.string().required()
});

async function handler(req, res) {
    return handleCors(req, res, asyncHandler(async (req, res) => {
        const { method } = req;

        switch (method) {
            case 'POST':
                return await handleGoogleAuth(req, res);
            default:
                return error(res, 'Method not allowed', 405);
        }
    }));
}

async function handleGoogleAuth(req, res) {
    // Validate request body
    const { error: validationErr, value } = googleAuthSchema.validate(req.body);
    if (validationErr) {
        return validationError(res, validationErr.details);
    }

    const { idToken, accessToken } = value;

    try {
        // Verify Google ID token
        const userInfo = await verifyGoogleToken(idToken);
        
        if (!userInfo) {
            return error(res, 'Invalid Google token', 401);
        }

        const { email, name, picture } = userInfo;

        // Check if user exists
        let users = await query(
            'SELECT u.*, o.id as org_id, o.name as org_name, o.type as org_type FROM users u LEFT JOIN organizations o ON u.organization_id = o.id WHERE u.email = ? AND u.is_active = 1',
            [email]
        );

        let user;

        if (users.length === 0) {
            // Create new user and organization for Google sign-up
            const orgResult = await query(
                'INSERT INTO organizations (name, type, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
                [`${name}'s Organization`, 'church']
            );

            const organizationId = orgResult.insertId;

            const userResult = await query(
                'INSERT INTO users (email, display_name, avatar_url, organization_id, role, provider, provider_id, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())',
                [email, name, picture, organizationId, 'admin', 'google', userInfo.sub]
            );

            // Get the created user
            users = await query(
                'SELECT u.*, o.id as org_id, o.name as org_name, o.type as org_type FROM users u LEFT JOIN organizations o ON u.organization_id = o.id WHERE u.id = ?',
                [userResult.insertId]
            );
            user = users[0];
        } else {
            user = users[0];
            
            // Update user info from Google if needed
            await query(
                'UPDATE users SET display_name = ?, avatar_url = ?, provider = ?, provider_id = ?, updated_at = NOW() WHERE id = ?',
                [name, picture, 'google', userInfo.sub, user.id]
            );
        }

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organization_id
        });

        // Update last login
        await query(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [user.id]
        );

        const userResponse = {
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            avatarUrl: user.avatar_url,
            role: {
                name: user.role,
                permissions: getRolePermissions(user.role)
            },
            isActive: user.is_active,
            lastLogin: user.last_login,
            createdAt: user.created_at,
            updatedAt: user.updated_at
        };

        const organizationResponse = user.org_id ? {
            id: user.org_id,
            name: user.org_name,
            type: user.org_type
        } : null;

        return success(res, {
            message: 'Google authentication successful',
            token,
            user: userResponse,
            organization: organizationResponse
        });

    } catch (err) {
        console.error('Google auth error:', err);
        return error(res, 'Authentication failed', 500);
    }
}

// Mock Google token verification (replace with actual Google Auth library)
async function verifyGoogleToken(idToken) {
    try {
        // In production, use the Google Auth Library to verify the token
        // const { OAuth2Client } = require('google-auth-library');
        // const client = new OAuth2Client(CLIENT_ID);
        // const ticket = await client.verifyIdToken({
        //     idToken: idToken,
        //     audience: CLIENT_ID,
        // });
        // const payload = ticket.getPayload();
        
        // For demo purposes, return mock user info
        // Replace this with actual token verification
        return {
            sub: 'google_user_id',
            email: 'user@gmail.com',
            name: 'Demo User',
            picture: 'https://via.placeholder.com/150'
        };
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

function getRolePermissions(role) {
    const permissions = {
        admin: [
            'manage_organization',
            'manage_members',
            'send_messages',
            'view_analytics',
            'manage_templates',
            'manage_automation'
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
