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
                return await getAutomationRules(req, res, connection, currentUser);
            case 'POST':
                return await createAutomationRule(req, res, connection, currentUser);
            case 'PUT':
                return await updateAutomationRule(req, res, connection, currentUser);
            case 'DELETE':
                return await deleteAutomationRule(req, res, connection, currentUser);
            default:
                return apiError(res, 'Method not allowed', 405);
        }
    } catch (error) {
        console.error('Automation API error:', error);
        return apiError(res, 'Internal server error', 500);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function getAutomationRules(req, res, connection, currentUser) {
    const {
        page = 1,
        limit = 20,
        triggerType,
        isActive,
        organizationId
    } = req.query;

    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    // Filter by organization
    const targetOrgId = currentUser.role === 'admin' && organizationId ?
        organizationId : currentUser.organizationId;

    if (targetOrgId) {
        whereClause += ' AND ar.organization_id = ?';
        params.push(targetOrgId);
    }

    // Trigger type filter
    if (triggerType) {
        whereClause += ' AND ar.trigger_type = ?';
        params.push(triggerType);
    }

    // Active status filter
    if (isActive !== undefined) {
        whereClause += ' AND ar.is_active = ?';
        params.push(isActive === 'true');
    }

    // Get total count
    const [countResult] = await connection.execute(
        `SELECT COUNT(*) as total FROM automation_rules ar ${whereClause}`,
        params
    );
    const total = countResult[0].total;

    // Get automation rules with pagination
    const [rules] = await connection.execute(
        `SELECT ar.*, u.display_name as created_by_name, o.name as organization_name
         FROM automation_rules ar
         LEFT JOIN users u ON ar.created_by = u.id
         LEFT JOIN organizations o ON ar.organization_id = o.id
         ${whereClause}
         ORDER BY ar.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), offset]
    );

    // Get execution logs for each rule
    const ruleData = await Promise.all(rules.map(async (rule) => {
        const [logs] = await connection.execute(
            `SELECT COUNT(*) as total_executions,
                    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_executions,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_executions,
                    MAX(execution_date) as last_execution
             FROM automation_logs 
             WHERE rule_id = ?`,
            [rule.id]
        );

        return {
            id: rule.id,
            organizationId: rule.organization_id,
            organizationName: rule.organization_name,
            name: rule.name,
            description: rule.description,
            triggerType: rule.trigger_type,
            triggerConditions: rule.trigger_conditions ? JSON.parse(rule.trigger_conditions) : {},
            actionType: rule.action_type,
            actionConfig: rule.action_config ? JSON.parse(rule.action_config) : {},
            isActive: rule.is_active,
            createdBy: rule.created_by,
            createdByName: rule.created_by_name,
            createdAt: rule.created_at,
            updatedAt: rule.updated_at,
            executions: logs[0]
        };
    }));

    return apiResponse(res, {
        rules: ruleData,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
}

async function createAutomationRule(req, res, connection, currentUser) {
    // Check permissions
    if (!hasPermission(currentUser.role, ['admin', 'pastor', 'leader'])) {
        return apiError(res, 'Insufficient permissions', 403);
    }

    const {
        name,
        description,
        triggerType,
        triggerConditions = {},
        actionType,
        actionConfig = {}
    } = req.body;

    // Validation
    if (!name || !triggerType || !actionType) {
        return apiError(res, 'Name, trigger type, and action type are required', 400);
    }

    if (!['birthday', 'anniversary', 'new_member', 'attendance_absence', 'date_based', 'manual'].includes(triggerType)) {
        return apiError(res, 'Invalid trigger type', 400);
    }

    if (!['send_message', 'create_note', 'assign_task', 'notification'].includes(actionType)) {
        return apiError(res, 'Invalid action type', 400);
    }

    // Set organization
    const organizationId = currentUser.organizationId;
    if (!organizationId) {
        return apiError(res, 'Organization ID is required', 400);
    }

    // Validate trigger conditions and action config based on types
    const validationError = validateRuleConfiguration(triggerType, triggerConditions, actionType, actionConfig);
    if (validationError) {
        return apiError(res, validationError, 400);
    }

    // Create automation rule
    const ruleId = require('crypto').randomUUID();
    await connection.execute(
        `INSERT INTO automation_rules (
            id, organization_id, name, description, trigger_type, trigger_conditions,
            action_type, action_config, is_active, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            ruleId, organizationId, name, description, triggerType,
            JSON.stringify(triggerConditions), actionType, JSON.stringify(actionConfig),
            true, currentUser.userId
        ]
    );

    // Get created rule data
    const [newRule] = await connection.execute(
        `SELECT ar.*, u.display_name as created_by_name, o.name as organization_name
         FROM automation_rules ar
         LEFT JOIN users u ON ar.created_by = u.id
         LEFT JOIN organizations o ON ar.organization_id = o.id
         WHERE ar.id = ?`,
        [ruleId]
    );

    const ruleData = {
        id: newRule[0].id,
        organizationId: newRule[0].organization_id,
        organizationName: newRule[0].organization_name,
        name: newRule[0].name,
        description: newRule[0].description,
        triggerType: newRule[0].trigger_type,
        triggerConditions: newRule[0].trigger_conditions ? JSON.parse(newRule[0].trigger_conditions) : {},
        actionType: newRule[0].action_type,
        actionConfig: newRule[0].action_config ? JSON.parse(newRule[0].action_config) : {},
        isActive: newRule[0].is_active,
        createdBy: newRule[0].created_by,
        createdByName: newRule[0].created_by_name,
        createdAt: newRule[0].created_at,
        updatedAt: newRule[0].updated_at
    };

    return apiResponse(res, {
        message: 'Automation rule created successfully',
        rule: ruleData
    }, 201);
}

async function updateAutomationRule(req, res, connection, currentUser) {
    const { id } = req.query;
    if (!id) {
        return apiError(res, 'Rule ID is required', 400);
    }

    // Get existing rule
    const [existingRules] = await connection.execute(
        'SELECT * FROM automation_rules WHERE id = ?',
        [id]
    );

    if (existingRules.length === 0) {
        return apiError(res, 'Automation rule not found', 404);
    }

    const existingRule = existingRules[0];

    // Check permissions
    if (currentUser.userId !== existingRule.created_by &&
        !hasPermission(currentUser.role, ['admin', 'pastor'])) {
        return apiError(res, 'Insufficient permissions', 403);
    }

    // Check organization access
    if (currentUser.role !== 'admin' && existingRule.organization_id !== currentUser.organizationId) {
        return apiError(res, 'Cannot modify automation rules from other organizations', 403);
    }

    const {
        name,
        description,
        triggerType,
        triggerConditions,
        actionType,
        actionConfig,
        isActive
    } = req.body;

    // Build update query
    const updateFields = [];
    const params = [];

    if (name !== undefined) {
        updateFields.push('name = ?');
        params.push(name);
    }
    if (description !== undefined) {
        updateFields.push('description = ?');
        params.push(description);
    }
    if (triggerType !== undefined && ['birthday', 'anniversary', 'new_member', 'attendance_absence', 'date_based', 'manual'].includes(triggerType)) {
        updateFields.push('trigger_type = ?');
        params.push(triggerType);
    }
    if (triggerConditions !== undefined) {
        updateFields.push('trigger_conditions = ?');
        params.push(JSON.stringify(triggerConditions));
    }
    if (actionType !== undefined && ['send_message', 'create_note', 'assign_task', 'notification'].includes(actionType)) {
        updateFields.push('action_type = ?');
        params.push(actionType);
    }
    if (actionConfig !== undefined) {
        updateFields.push('action_config = ?');
        params.push(JSON.stringify(actionConfig));
    }
    if (isActive !== undefined) {
        updateFields.push('is_active = ?');
        params.push(isActive);
    }

    if (updateFields.length === 0) {
        return apiError(res, 'No valid fields to update', 400);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    // Update rule
    await connection.execute(
        `UPDATE automation_rules SET ${updateFields.join(', ')} WHERE id = ?`,
        params
    );

    return apiResponse(res, {
        message: 'Automation rule updated successfully'
    });
}

async function deleteAutomationRule(req, res, connection, currentUser) {
    const { id } = req.query;
    if (!id) {
        return apiError(res, 'Rule ID is required', 400);
    }

    // Get rule
    const [rules] = await connection.execute(
        'SELECT created_by, organization_id FROM automation_rules WHERE id = ?',
        [id]
    );

    if (rules.length === 0) {
        return apiError(res, 'Automation rule not found', 404);
    }

    const rule = rules[0];

    // Check permissions
    if (currentUser.userId !== rule.created_by &&
        !hasPermission(currentUser.role, ['admin', 'pastor'])) {
        return apiError(res, 'Insufficient permissions', 403);
    }

    // Check organization access
    if (currentUser.role !== 'admin' && rule.organization_id !== currentUser.organizationId) {
        return apiError(res, 'Cannot delete automation rules from other organizations', 403);
    }

    // Delete rule (cascade will handle logs)
    await connection.execute('DELETE FROM automation_rules WHERE id = ?', [id]);

    return apiResponse(res, {
        message: 'Automation rule deleted successfully'
    });
}

// Validation helper function
function validateRuleConfiguration(triggerType, triggerConditions, actionType, actionConfig) {
    // Validate trigger conditions based on trigger type
    switch (triggerType) {
        case 'birthday':
            if (!triggerConditions.daysBeforeAfter) {
                return 'Birthday triggers require daysBeforeAfter configuration';
            }
            break;
        case 'anniversary':
            if (!triggerConditions.anniversaryType || !triggerConditions.daysBeforeAfter) {
                return 'Anniversary triggers require anniversaryType and daysBeforeAfter configuration';
            }
            break;
        case 'new_member':
            if (!triggerConditions.daysAfterJoining) {
                return 'New member triggers require daysAfterJoining configuration';
            }
            break;
        case 'attendance_absence':
            if (!triggerConditions.absenceDays) {
                return 'Attendance absence triggers require absenceDays configuration';
            }
            break;
        case 'date_based':
            if (!triggerConditions.targetDate && !triggerConditions.recurring) {
                return 'Date-based triggers require targetDate or recurring configuration';
            }
            break;
    }

    // Validate action config based on action type
    switch (actionType) {
        case 'send_message':
            if (!actionConfig.templateId && !actionConfig.messageContent) {
                return 'Send message actions require templateId or messageContent';
            }
            if (!actionConfig.messageType) {
                return 'Send message actions require messageType';
            }
            break;
        case 'create_note':
            if (!actionConfig.noteTitle || !actionConfig.noteContent) {
                return 'Create note actions require noteTitle and noteContent';
            }
            break;
        case 'assign_task':
            if (!actionConfig.taskTitle || !actionConfig.assigneeId) {
                return 'Assign task actions require taskTitle and assigneeId';
            }
            break;
        case 'notification':
            if (!actionConfig.notificationTitle || !actionConfig.notificationMessage) {
                return 'Notification actions require notificationTitle and notificationMessage';
            }
            break;
    }

    return null; // No validation errors
}
