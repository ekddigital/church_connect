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
                return await getMessages(req, res, connection, currentUser);
            case 'POST':
                return await createMessage(req, res, connection, currentUser);
            case 'PUT':
                return await updateMessage(req, res, connection, currentUser);
            case 'DELETE':
                return await deleteMessage(req, res, connection, currentUser);
            default:
                return apiError(res, 'Method not allowed', 405);
        }
    } catch (error) {
        console.error('Messages API error:', error);
        return apiError(res, 'Internal server error', 500);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function getMessages(req, res, connection, currentUser) {
    const {
        page = 1,
        limit = 20,
        status,
        messageType,
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

    // Status filter
    if (status) {
        whereClause += ' AND m.status = ?';
        params.push(status);
    }

    // Message type filter
    if (messageType) {
        whereClause += ' AND m.message_type = ?';
        params.push(messageType);
    }

    // Get total count
    const [countResult] = await connection.execute(
        `SELECT COUNT(*) as total FROM messages m ${whereClause}`,
        params
    );
    const total = countResult[0].total;

    // Get messages with pagination
    const [messages] = await connection.execute(
        `SELECT m.*, u.display_name as sender_name, t.name as template_name,
                o.name as organization_name
         FROM messages m
         LEFT JOIN users u ON m.sender_id = u.id
         LEFT JOIN message_templates t ON m.template_id = t.id
         LEFT JOIN organizations o ON m.organization_id = o.id
         ${whereClause}
         ORDER BY m.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), offset]
    );

    const messageData = messages.map(message => ({
        id: message.id,
        organizationId: message.organization_id,
        organizationName: message.organization_name,
        senderId: message.sender_id,
        senderName: message.sender_name,
        templateId: message.template_id,
        templateName: message.template_name,
        subject: message.subject,
        content: message.content,
        messageType: message.message_type,
        sendMethod: message.send_method,
        scheduledAt: message.scheduled_at,
        sentAt: message.sent_at,
        status: message.status,
        recipientCount: message.recipient_count,
        sentCount: message.sent_count,
        failedCount: message.failed_count,
        createdAt: message.created_at,
        updatedAt: message.updated_at
    }));

    return apiResponse(res, {
        messages: messageData,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
}

async function createMessage(req, res, connection, currentUser) {
    // Check permissions
    if (!hasPermission(currentUser.role, ['admin', 'pastor', 'leader'])) {
        return apiError(res, 'Insufficient permissions', 403);
    }

    const {
        subject,
        content,
        messageType,
        sendMethod = 'immediate',
        scheduledAt,
        templateId,
        recipients = [] // Array of member IDs or 'all'
    } = req.body;

    // Validation
    if (!content || !messageType) {
        return apiError(res, 'Content and message type are required', 400);
    }

    if (!['email', 'sms', 'notification'].includes(messageType)) {
        return apiError(res, 'Invalid message type', 400);
    }

    if (!['immediate', 'scheduled'].includes(sendMethod)) {
        return apiError(res, 'Invalid send method', 400);
    }

    if (sendMethod === 'scheduled' && !scheduledAt) {
        return apiError(res, 'Scheduled date is required for scheduled messages', 400);
    }

    // Set organization
    const organizationId = currentUser.organizationId;
    if (!organizationId) {
        return apiError(res, 'Organization ID is required', 400);
    }

    // Create message
    const messageId = require('crypto').randomUUID();
    const status = sendMethod === 'scheduled' ? 'scheduled' : 'draft';

    await connection.execute(
        `INSERT INTO messages (
            id, organization_id, sender_id, template_id, subject, content,
            message_type, send_method, scheduled_at, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            messageId, organizationId, currentUser.userId, templateId, subject, content,
            messageType, sendMethod, scheduledAt, status
        ]
    );

    // Handle recipients
    let recipientMembers = [];

    if (recipients.includes('all') || recipients.length === 0) {
        // Get all active members from organization
        const [allMembers] = await connection.execute(
            `SELECT id, email, phone, first_name, last_name 
             FROM members 
             WHERE organization_id = ? AND status = 'active'`,
            [organizationId]
        );
        recipientMembers = allMembers;
    } else {
        // Get specific members
        const placeholders = recipients.map(() => '?').join(',');
        const [selectedMembers] = await connection.execute(
            `SELECT id, email, phone, first_name, last_name 
             FROM members 
             WHERE id IN (${placeholders}) AND organization_id = ? AND status = 'active'`,
            [...recipients, organizationId]
        );
        recipientMembers = selectedMembers;
    }

    // Insert recipients
    for (const member of recipientMembers) {
        const recipientId = require('crypto').randomUUID();
        await connection.execute(
            `INSERT INTO message_recipients (id, message_id, member_id, email, phone, status)
             VALUES (?, ?, ?, ?, ?, 'pending')`,
            [recipientId, messageId, member.id, member.email, member.phone]
        );
    }

    // Update message with recipient count
    await connection.execute(
        'UPDATE messages SET recipient_count = ? WHERE id = ?',
        [recipientMembers.length, messageId]
    );

    // If immediate send, process the message
    if (sendMethod === 'immediate') {
        await processMessage(messageId, connection);
    }

    // Get created message data
    const [newMessage] = await connection.execute(
        `SELECT m.*, u.display_name as sender_name, o.name as organization_name
         FROM messages m
         LEFT JOIN users u ON m.sender_id = u.id
         LEFT JOIN organizations o ON m.organization_id = o.id
         WHERE m.id = ?`,
        [messageId]
    );

    const messageData = {
        id: newMessage[0].id,
        organizationId: newMessage[0].organization_id,
        organizationName: newMessage[0].organization_name,
        senderId: newMessage[0].sender_id,
        senderName: newMessage[0].sender_name,
        templateId: newMessage[0].template_id,
        subject: newMessage[0].subject,
        content: newMessage[0].content,
        messageType: newMessage[0].message_type,
        sendMethod: newMessage[0].send_method,
        scheduledAt: newMessage[0].scheduled_at,
        sentAt: newMessage[0].sent_at,
        status: newMessage[0].status,
        recipientCount: newMessage[0].recipient_count,
        sentCount: newMessage[0].sent_count,
        failedCount: newMessage[0].failed_count,
        createdAt: newMessage[0].created_at,
        updatedAt: newMessage[0].updated_at
    };

    return apiResponse(res, {
        message: 'Message created successfully',
        messageData
    }, 201);
}

async function updateMessage(req, res, connection, currentUser) {
    const { id } = req.query;
    if (!id) {
        return apiError(res, 'Message ID is required', 400);
    }

    // Get existing message
    const [existingMessages] = await connection.execute(
        'SELECT * FROM messages WHERE id = ?',
        [id]
    );

    if (existingMessages.length === 0) {
        return apiError(res, 'Message not found', 404);
    }

    const existingMessage = existingMessages[0];

    // Check permissions
    if (currentUser.userId !== existingMessage.sender_id &&
        !hasPermission(currentUser.role, ['admin', 'pastor'])) {
        return apiError(res, 'Insufficient permissions', 403);
    }

    // Cannot update sent messages
    if (existingMessage.status === 'sent' || existingMessage.status === 'sending') {
        return apiError(res, 'Cannot update messages that have been sent or are being sent', 400);
    }

    const { subject, content, scheduledAt, status } = req.body;

    // Build update query
    const updateFields = [];
    const params = [];

    if (subject !== undefined) {
        updateFields.push('subject = ?');
        params.push(subject);
    }
    if (content !== undefined) {
        updateFields.push('content = ?');
        params.push(content);
    }
    if (scheduledAt !== undefined) {
        updateFields.push('scheduled_at = ?');
        params.push(scheduledAt);
    }
    if (status !== undefined && ['draft', 'scheduled'].includes(status)) {
        updateFields.push('status = ?');
        params.push(status);
    }

    if (updateFields.length === 0) {
        return apiError(res, 'No valid fields to update', 400);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    // Update message
    await connection.execute(
        `UPDATE messages SET ${updateFields.join(', ')} WHERE id = ?`,
        params
    );

    return apiResponse(res, {
        message: 'Message updated successfully'
    });
}

async function deleteMessage(req, res, connection, currentUser) {
    const { id } = req.query;
    if (!id) {
        return apiError(res, 'Message ID is required', 400);
    }

    // Get message
    const [messages] = await connection.execute(
        'SELECT sender_id, status FROM messages WHERE id = ?',
        [id]
    );

    if (messages.length === 0) {
        return apiError(res, 'Message not found', 404);
    }

    const message = messages[0];

    // Check permissions
    if (currentUser.userId !== message.sender_id &&
        !hasPermission(currentUser.role, ['admin', 'pastor'])) {
        return apiError(res, 'Insufficient permissions', 403);
    }

    // Cannot delete sent messages
    if (message.status === 'sent' || message.status === 'sending') {
        return apiError(res, 'Cannot delete messages that have been sent or are being sent', 400);
    }

    // Delete message (cascade will handle recipients)
    await connection.execute('DELETE FROM messages WHERE id = ?', [id]);

    return apiResponse(res, {
        message: 'Message deleted successfully'
    });
}

// Helper function to process immediate messages
async function processMessage(messageId, connection) {
    try {
        // Update message status to sending
        await connection.execute(
            'UPDATE messages SET status = ?, sent_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['sending', messageId]
        );

        // Get message details
        const [messages] = await connection.execute(
            'SELECT * FROM messages WHERE id = ?',
            [messageId]
        );

        if (messages.length === 0) return;

        const message = messages[0];

        // Get recipients
        const [recipients] = await connection.execute(
            'SELECT * FROM message_recipients WHERE message_id = ? AND status = "pending"',
            [messageId]
        );

        let sentCount = 0;
        let failedCount = 0;

        // Process each recipient
        for (const recipient of recipients) {
            try {
                // Here you would integrate with actual email/SMS services
                // For now, we'll simulate successful delivery

                if (message.message_type === 'email' && recipient.email) {
                    // TODO: Send email using service like SendGrid, AWS SES, etc.
                    await connection.execute(
                        'UPDATE message_recipients SET status = ?, sent_at = CURRENT_TIMESTAMP WHERE id = ?',
                        ['sent', recipient.id]
                    );
                    sentCount++;
                } else if (message.message_type === 'sms' && recipient.phone) {
                    // TODO: Send SMS using service like Twilio, AWS SNS, etc.
                    await connection.execute(
                        'UPDATE message_recipients SET status = ?, sent_at = CURRENT_TIMESTAMP WHERE id = ?',
                        ['sent', recipient.id]
                    );
                    sentCount++;
                } else if (message.message_type === 'notification') {
                    // TODO: Send push notification
                    await connection.execute(
                        'UPDATE message_recipients SET status = ?, sent_at = CURRENT_TIMESTAMP WHERE id = ?',
                        ['sent', recipient.id]
                    );
                    sentCount++;
                } else {
                    // No valid contact method
                    await connection.execute(
                        'UPDATE message_recipients SET status = ?, error_message = ? WHERE id = ?',
                        ['failed', 'No valid contact information', recipient.id]
                    );
                    failedCount++;
                }
            } catch (error) {
                // Mark as failed
                await connection.execute(
                    'UPDATE message_recipients SET status = ?, error_message = ? WHERE id = ?',
                    ['failed', error.message, recipient.id]
                );
                failedCount++;
            }
        }

        // Update message status and counts
        await connection.execute(
            'UPDATE messages SET status = ?, sent_count = ?, failed_count = ? WHERE id = ?',
            ['sent', sentCount, failedCount, messageId]
        );

    } catch (error) {
        console.error('Error processing message:', error);
        // Mark message as failed
        await connection.execute(
            'UPDATE messages SET status = ? WHERE id = ?',
            ['failed', messageId]
        );
    }
}
