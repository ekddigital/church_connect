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
                return await getMembers(req, res, connection, currentUser);
            case 'POST':
                return await createMember(req, res, connection, currentUser);
            case 'PUT':
                return await updateMember(req, res, connection, currentUser);
            case 'DELETE':
                return await deleteMember(req, res, connection, currentUser);
            default:
                return apiError(res, 'Method not allowed', 405);
        }
    } catch (error) {
        console.error('Members API error:', error);
        return apiError(res, 'Internal server error', 500);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function getMembers(req, res, connection, currentUser) {
    const {
        page = 1,
        limit = 20,
        search,
        status,
        memberType,
        gender,
        organizationId
    } = req.query;

    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    // Filter by organization
    const targetOrgId = currentUser.role === 'admin' && organizationId ?
        organizationId : currentUser.organizationId;

    if (targetOrgId) {
        whereClause += ' AND m.organization_id = ?';
        params.push(targetOrgId);
    }

    // Search filter
    if (search) {
        whereClause += ' AND (m.first_name LIKE ? OR m.last_name LIKE ? OR m.email LIKE ? OR m.phone LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Status filter
    if (status) {
        whereClause += ' AND m.status = ?';
        params.push(status);
    }

    // Member type filter
    if (memberType) {
        whereClause += ' AND m.member_type = ?';
        params.push(memberType);
    }

    // Gender filter
    if (gender) {
        whereClause += ' AND m.gender = ?';
        params.push(gender);
    }

    // Get total count
    const [countResult] = await connection.execute(
        `SELECT COUNT(*) as total FROM members m ${whereClause}`,
        params
    );
    const total = countResult[0].total;

    // Get members with pagination
    const [members] = await connection.execute(
        `SELECT m.*, o.name as organization_name
         FROM members m
         LEFT JOIN organizations o ON m.organization_id = o.id
         ${whereClause}
         ORDER BY m.first_name, m.last_name
         LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), offset]
    );

    const memberData = members.map(member => ({
        id: member.id,
        organizationId: member.organization_id,
        organizationName: member.organization_name,
        firstName: member.first_name,
        lastName: member.last_name,
        email: member.email,
        phone: member.phone,
        address: member.address,
        dateOfBirth: member.date_of_birth,
        gender: member.gender,
        maritalStatus: member.marital_status,
        memberSince: member.member_since,
        memberType: member.member_type,
        status: member.status,
        emergencyContactName: member.emergency_contact_name,
        emergencyContactPhone: member.emergency_contact_phone,
        notes: member.notes,
        tags: member.tags ? JSON.parse(member.tags) : [],
        createdAt: member.created_at,
        updatedAt: member.updated_at
    }));

    return apiResponse(res, {
        members: memberData,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
}

async function createMember(req, res, connection, currentUser) {
    // Check permissions
    if (!hasPermission(currentUser.role, ['admin', 'pastor', 'leader'])) {
        return apiError(res, 'Insufficient permissions', 403);
    }

    const {
        firstName,
        lastName,
        email,
        phone,
        address,
        dateOfBirth,
        gender,
        maritalStatus,
        memberSince,
        memberType = 'regular',
        emergencyContactName,
        emergencyContactPhone,
        notes,
        tags = []
    } = req.body;

    // Validation
    if (!firstName || !lastName) {
        return apiError(res, 'First name and last name are required', 400);
    }

    // Set organization
    const organizationId = currentUser.role === 'admin' && req.body.organizationId ?
        req.body.organizationId : currentUser.organizationId;

    if (!organizationId) {
        return apiError(res, 'Organization ID is required', 400);
    }

    // Check for duplicate email/phone if provided
    if (email) {
        const [existingEmail] = await connection.execute(
            'SELECT id FROM members WHERE email = ? AND organization_id = ?',
            [email, organizationId]
        );
        if (existingEmail.length > 0) {
            return apiError(res, 'Member with this email already exists in this organization', 409);
        }
    }

    if (phone) {
        const [existingPhone] = await connection.execute(
            'SELECT id FROM members WHERE phone = ? AND organization_id = ?',
            [phone, organizationId]
        );
        if (existingPhone.length > 0) {
            return apiError(res, 'Member with this phone number already exists in this organization', 409);
        }
    }

    // Create member
    const memberId = require('crypto').randomUUID();
    await connection.execute(
        `INSERT INTO members (
            id, organization_id, first_name, last_name, email, phone, address,
            date_of_birth, gender, marital_status, member_since, member_type,
            emergency_contact_name, emergency_contact_phone, notes, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            memberId, organizationId, firstName, lastName, email, phone, address,
            dateOfBirth, gender, maritalStatus, memberSince || new Date().toISOString().split('T')[0],
            memberType, emergencyContactName, emergencyContactPhone, notes,
            tags.length > 0 ? JSON.stringify(tags) : null
        ]
    );

    // Get created member data
    const [newMember] = await connection.execute(
        `SELECT m.*, o.name as organization_name
         FROM members m
         LEFT JOIN organizations o ON m.organization_id = o.id
         WHERE m.id = ?`,
        [memberId]
    );

    const memberData = {
        id: newMember[0].id,
        organizationId: newMember[0].organization_id,
        organizationName: newMember[0].organization_name,
        firstName: newMember[0].first_name,
        lastName: newMember[0].last_name,
        email: newMember[0].email,
        phone: newMember[0].phone,
        address: newMember[0].address,
        dateOfBirth: newMember[0].date_of_birth,
        gender: newMember[0].gender,
        maritalStatus: newMember[0].marital_status,
        memberSince: newMember[0].member_since,
        memberType: newMember[0].member_type,
        status: newMember[0].status,
        emergencyContactName: newMember[0].emergency_contact_name,
        emergencyContactPhone: newMember[0].emergency_contact_phone,
        notes: newMember[0].notes,
        tags: newMember[0].tags ? JSON.parse(newMember[0].tags) : [],
        createdAt: newMember[0].created_at,
        updatedAt: newMember[0].updated_at
    };

    return apiResponse(res, {
        message: 'Member created successfully',
        member: memberData
    }, 201);
}

async function updateMember(req, res, connection, currentUser) {
    // Check permissions
    if (!hasPermission(currentUser.role, ['admin', 'pastor', 'leader'])) {
        return apiError(res, 'Insufficient permissions', 403);
    }

    const { id } = req.query;
    if (!id) {
        return apiError(res, 'Member ID is required', 400);
    }

    // Get existing member
    const [existingMembers] = await connection.execute(
        'SELECT * FROM members WHERE id = ?',
        [id]
    );

    if (existingMembers.length === 0) {
        return apiError(res, 'Member not found', 404);
    }

    const existingMember = existingMembers[0];

    // Check organization access
    if (currentUser.role !== 'admin' && existingMember.organization_id !== currentUser.organizationId) {
        return apiError(res, 'Cannot modify members from other organizations', 403);
    }

    const {
        firstName,
        lastName,
        email,
        phone,
        address,
        dateOfBirth,
        gender,
        maritalStatus,
        memberSince,
        memberType,
        status,
        emergencyContactName,
        emergencyContactPhone,
        notes,
        tags
    } = req.body;

    // Build update query
    const updateFields = [];
    const params = [];

    if (firstName !== undefined) {
        updateFields.push('first_name = ?');
        params.push(firstName);
    }
    if (lastName !== undefined) {
        updateFields.push('last_name = ?');
        params.push(lastName);
    }
    if (email !== undefined) {
        updateFields.push('email = ?');
        params.push(email);
    }
    if (phone !== undefined) {
        updateFields.push('phone = ?');
        params.push(phone);
    }
    if (address !== undefined) {
        updateFields.push('address = ?');
        params.push(address);
    }
    if (dateOfBirth !== undefined) {
        updateFields.push('date_of_birth = ?');
        params.push(dateOfBirth);
    }
    if (gender !== undefined) {
        updateFields.push('gender = ?');
        params.push(gender);
    }
    if (maritalStatus !== undefined) {
        updateFields.push('marital_status = ?');
        params.push(maritalStatus);
    }
    if (memberSince !== undefined) {
        updateFields.push('member_since = ?');
        params.push(memberSince);
    }
    if (memberType !== undefined) {
        updateFields.push('member_type = ?');
        params.push(memberType);
    }
    if (status !== undefined) {
        updateFields.push('status = ?');
        params.push(status);
    }
    if (emergencyContactName !== undefined) {
        updateFields.push('emergency_contact_name = ?');
        params.push(emergencyContactName);
    }
    if (emergencyContactPhone !== undefined) {
        updateFields.push('emergency_contact_phone = ?');
        params.push(emergencyContactPhone);
    }
    if (notes !== undefined) {
        updateFields.push('notes = ?');
        params.push(notes);
    }
    if (tags !== undefined) {
        updateFields.push('tags = ?');
        params.push(tags ? JSON.stringify(tags) : null);
    }

    if (updateFields.length === 0) {
        return apiError(res, 'No valid fields to update', 400);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    // Update member
    await connection.execute(
        `UPDATE members SET ${updateFields.join(', ')} WHERE id = ?`,
        params
    );

    // Get updated member data
    const [updatedMember] = await connection.execute(
        `SELECT m.*, o.name as organization_name
         FROM members m
         LEFT JOIN organizations o ON m.organization_id = o.id
         WHERE m.id = ?`,
        [id]
    );

    const memberData = {
        id: updatedMember[0].id,
        organizationId: updatedMember[0].organization_id,
        organizationName: updatedMember[0].organization_name,
        firstName: updatedMember[0].first_name,
        lastName: updatedMember[0].last_name,
        email: updatedMember[0].email,
        phone: updatedMember[0].phone,
        address: updatedMember[0].address,
        dateOfBirth: updatedMember[0].date_of_birth,
        gender: updatedMember[0].gender,
        maritalStatus: updatedMember[0].marital_status,
        memberSince: updatedMember[0].member_since,
        memberType: updatedMember[0].member_type,
        status: updatedMember[0].status,
        emergencyContactName: updatedMember[0].emergency_contact_name,
        emergencyContactPhone: updatedMember[0].emergency_contact_phone,
        notes: updatedMember[0].notes,
        tags: updatedMember[0].tags ? JSON.parse(updatedMember[0].tags) : [],
        createdAt: updatedMember[0].created_at,
        updatedAt: updatedMember[0].updated_at
    };

    return apiResponse(res, {
        message: 'Member updated successfully',
        member: memberData
    });
}

async function deleteMember(req, res, connection, currentUser) {
    // Check permissions - only admin and pastor can delete members
    if (!hasPermission(currentUser.role, ['admin', 'pastor'])) {
        return apiError(res, 'Insufficient permissions', 403);
    }

    const { id } = req.query;
    if (!id) {
        return apiError(res, 'Member ID is required', 400);
    }

    // Check if member exists and belongs to user's organization
    const [members] = await connection.execute(
        'SELECT organization_id FROM members WHERE id = ?',
        [id]
    );

    if (members.length === 0) {
        return apiError(res, 'Member not found', 404);
    }

    const member = members[0];

    // Check organization access
    if (currentUser.role !== 'admin' && member.organization_id !== currentUser.organizationId) {
        return apiError(res, 'Cannot delete members from other organizations', 403);
    }

    // Delete member (cascade will handle related records)
    await connection.execute('DELETE FROM members WHERE id = ?', [id]);

    return apiResponse(res, {
        message: 'Member deleted successfully'
    });
}
