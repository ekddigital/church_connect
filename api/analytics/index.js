const { createConnection } = require('../_lib/database');
const { verifyToken, hasPermission } = require('../_lib/auth');
const { apiResponse, apiError } = require('../_lib/response');

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return apiError(res, 'Method not allowed', 405);
    }

    // Verify authentication
    const authResult = verifyToken(req);
    if (!authResult.success) {
        return apiError(res, authResult.error, 401);
    }

    const currentUser = authResult.user;
    const connection = await createConnection();

    try {
        const { type, organizationId, startDate, endDate } = req.query;

        // Filter by organization
        const targetOrgId = currentUser.role === 'admin' && organizationId ?
            organizationId : currentUser.organizationId;

        if (!targetOrgId) {
            return apiError(res, 'Organization ID is required', 400);
        }

        switch (type) {
            case 'overview':
                return await getOverviewAnalytics(req, res, connection, targetOrgId);
            case 'members':
                return await getMemberAnalytics(req, res, connection, targetOrgId, startDate, endDate);
            case 'messages':
                return await getMessageAnalytics(req, res, connection, targetOrgId, startDate, endDate);
            case 'growth':
                return await getGrowthAnalytics(req, res, connection, targetOrgId, startDate, endDate);
            case 'engagement':
                return await getEngagementAnalytics(req, res, connection, targetOrgId, startDate, endDate);
            default:
                return await getOverviewAnalytics(req, res, connection, targetOrgId);
        }
    } catch (error) {
        console.error('Analytics API error:', error);
        return apiError(res, 'Internal server error', 500);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function getOverviewAnalytics(req, res, connection, organizationId) {
    // Get basic statistics
    const [memberStats] = await connection.execute(
        `SELECT 
            COUNT(*) as total_members,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active_members,
            COUNT(CASE WHEN member_type = 'new_convert' THEN 1 END) as new_converts,
            COUNT(CASE WHEN member_type = 'visitor' THEN 1 END) as visitors,
            COUNT(CASE WHEN member_type = 'leader' THEN 1 END) as leaders
         FROM members 
         WHERE organization_id = ?`,
        [organizationId]
    );

    const [messageStats] = await connection.execute(
        `SELECT 
            COUNT(*) as total_messages,
            COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_messages,
            COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_messages,
            SUM(sent_count) as total_recipients_reached
         FROM messages 
         WHERE organization_id = ?`,
        [organizationId]
    );

    const [templateStats] = await connection.execute(
        `SELECT 
            COUNT(*) as total_templates,
            COUNT(CASE WHEN is_active = true THEN 1 END) as active_templates
         FROM message_templates 
         WHERE organization_id = ?`,
        [organizationId]
    );

    const [automationStats] = await connection.execute(
        `SELECT 
            COUNT(*) as total_rules,
            COUNT(CASE WHEN is_active = true THEN 1 END) as active_rules
         FROM automation_rules 
         WHERE organization_id = ?`,
        [organizationId]
    );

    // Recent activity
    const [recentActivities] = await connection.execute(
        `SELECT 
            'member' as type, 
            CONCAT(first_name, ' ', last_name) as description,
            created_at as activity_date
         FROM members 
         WHERE organization_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         
         UNION ALL
         
         SELECT 
            'message' as type,
            CONCAT('Message sent: ', subject) as description,
            sent_at as activity_date
         FROM messages 
         WHERE organization_id = ? AND sent_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         
         ORDER BY activity_date DESC
         LIMIT 10`,
        [organizationId, organizationId]
    );

    return apiResponse(res, {
        overview: {
            members: memberStats[0],
            messages: messageStats[0],
            templates: templateStats[0],
            automation: automationStats[0]
        },
        recentActivity: recentActivities
    });
}

async function getMemberAnalytics(req, res, connection, organizationId, startDate, endDate) {
    const dateFilter = startDate && endDate ?
        'AND created_at BETWEEN ? AND ?' :
        'AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)';

    const dateParams = startDate && endDate ? [startDate, endDate] : [];

    // Member growth over time
    const [memberGrowth] = await connection.execute(
        `SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COUNT(*) as new_members
         FROM members 
         WHERE organization_id = ? ${dateFilter}
         GROUP BY DATE_FORMAT(created_at, '%Y-%m')
         ORDER BY month`,
        [organizationId, ...dateParams]
    );

    // Member demographics
    const [genderStats] = await connection.execute(
        `SELECT 
            gender,
            COUNT(*) as count
         FROM members 
         WHERE organization_id = ? AND status = 'active'
         GROUP BY gender`,
        [organizationId]
    );

    const [ageGroups] = await connection.execute(
        `SELECT 
            CASE 
                WHEN YEAR(CURDATE()) - YEAR(date_of_birth) < 18 THEN 'Under 18'
                WHEN YEAR(CURDATE()) - YEAR(date_of_birth) BETWEEN 18 AND 30 THEN '18-30'
                WHEN YEAR(CURDATE()) - YEAR(date_of_birth) BETWEEN 31 AND 50 THEN '31-50'
                WHEN YEAR(CURDATE()) - YEAR(date_of_birth) BETWEEN 51 AND 65 THEN '51-65'
                WHEN YEAR(CURDATE()) - YEAR(date_of_birth) > 65 THEN 'Over 65'
                ELSE 'Unknown'
            END as age_group,
            COUNT(*) as count
         FROM members 
         WHERE organization_id = ? AND status = 'active'
         GROUP BY age_group`,
        [organizationId]
    );

    const [memberTypes] = await connection.execute(
        `SELECT 
            member_type,
            COUNT(*) as count
         FROM members 
         WHERE organization_id = ? AND status = 'active'
         GROUP BY member_type`,
        [organizationId]
    );

    const [maritalStatus] = await connection.execute(
        `SELECT 
            marital_status,
            COUNT(*) as count
         FROM members 
         WHERE organization_id = ? AND status = 'active'
         GROUP BY marital_status`,
        [organizationId]
    );

    return apiResponse(res, {
        memberGrowth,
        demographics: {
            gender: genderStats,
            ageGroups,
            memberTypes,
            maritalStatus
        }
    });
}

async function getMessageAnalytics(req, res, connection, organizationId, startDate, endDate) {
    const dateFilter = startDate && endDate ?
        'AND created_at BETWEEN ? AND ?' :
        'AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)';

    const dateParams = startDate && endDate ? [startDate, endDate] : [];

    // Message volume over time
    const [messageVolume] = await connection.execute(
        `SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COUNT(*) as total_messages,
            COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_messages,
            SUM(sent_count) as total_recipients
         FROM messages 
         WHERE organization_id = ? ${dateFilter}
         GROUP BY DATE_FORMAT(created_at, '%Y-%m')
         ORDER BY month`,
        [organizationId, ...dateParams]
    );

    // Message types breakdown
    const [messageTypes] = await connection.execute(
        `SELECT 
            message_type,
            COUNT(*) as count,
            AVG(sent_count) as avg_recipients
         FROM messages 
         WHERE organization_id = ? AND status = 'sent' ${dateFilter}
         GROUP BY message_type`,
        [organizationId, ...dateParams]
    );

    // Message success rates
    const [successRates] = await connection.execute(
        `SELECT 
            message_type,
            SUM(recipient_count) as total_recipients,
            SUM(sent_count) as successful_sends,
            SUM(failed_count) as failed_sends,
            ROUND((SUM(sent_count) / SUM(recipient_count)) * 100, 2) as success_rate
         FROM messages 
         WHERE organization_id = ? AND status = 'sent' ${dateFilter}
         GROUP BY message_type`,
        [organizationId, ...dateParams]
    );

    // Popular templates
    const [popularTemplates] = await connection.execute(
        `SELECT 
            t.name,
            t.category,
            COUNT(m.id) as usage_count
         FROM message_templates t
         LEFT JOIN messages m ON t.id = m.template_id
         WHERE t.organization_id = ? ${dateFilter.replace('created_at', 'm.created_at')}
         GROUP BY t.id, t.name, t.category
         ORDER BY usage_count DESC
         LIMIT 10`,
        [organizationId, ...dateParams]
    );

    return apiResponse(res, {
        messageVolume,
        messageTypes,
        successRates,
        popularTemplates
    });
}

async function getGrowthAnalytics(req, res, connection, organizationId, startDate, endDate) {
    const dateFilter = startDate && endDate ?
        'AND created_at BETWEEN ? AND ?' :
        'AND created_at >= DATE_SUB(NOW(), INTERVAL 24 MONTH)';

    const dateParams = startDate && endDate ? [startDate, endDate] : [];

    // Monthly growth rate
    const [monthlyGrowth] = await connection.execute(
        `SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COUNT(*) as new_members,
            LAG(COUNT(*)) OVER (ORDER BY DATE_FORMAT(created_at, '%Y-%m')) as prev_month,
            CASE 
                WHEN LAG(COUNT(*)) OVER (ORDER BY DATE_FORMAT(created_at, '%Y-%m')) > 0 
                THEN ROUND(((COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY DATE_FORMAT(created_at, '%Y-%m'))) 
                     / LAG(COUNT(*)) OVER (ORDER BY DATE_FORMAT(created_at, '%Y-%m'))) * 100, 2)
                ELSE 0 
            END as growth_rate
         FROM members 
         WHERE organization_id = ? ${dateFilter}
         GROUP BY DATE_FORMAT(created_at, '%Y-%m')
         ORDER BY month`,
        [organizationId, ...dateParams]
    );

    // Member retention (members still active after joining)
    const [retention] = await connection.execute(
        `SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as join_month,
            COUNT(*) as total_joined,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as still_active,
            ROUND((COUNT(CASE WHEN status = 'active' THEN 1 END) / COUNT(*)) * 100, 2) as retention_rate
         FROM members 
         WHERE organization_id = ? ${dateFilter}
         GROUP BY DATE_FORMAT(created_at, '%Y-%m')
         ORDER BY join_month`,
        [organizationId, ...dateParams]
    );

    // Member lifecycle stages
    const [lifecycle] = await connection.execute(
        `SELECT 
            member_type as stage,
            COUNT(*) as count,
            ROUND((COUNT(*) / (SELECT COUNT(*) FROM members WHERE organization_id = ? AND status = 'active')) * 100, 2) as percentage
         FROM members 
         WHERE organization_id = ? AND status = 'active'
         GROUP BY member_type`,
        [organizationId, organizationId]
    );

    return apiResponse(res, {
        monthlyGrowth,
        retention,
        lifecycle
    });
}

async function getEngagementAnalytics(req, res, connection, organizationId, startDate, endDate) {
    const dateFilter = startDate && endDate ?
        'AND activity_date BETWEEN ? AND ?' :
        'AND activity_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)';

    const dateParams = startDate && endDate ? [startDate, endDate] : [];

    // Activity engagement
    const [activityEngagement] = await connection.execute(
        `SELECT 
            activity_type,
            COUNT(*) as total_activities,
            COUNT(DISTINCT member_id) as unique_participants,
            DATE_FORMAT(activity_date, '%Y-%m') as month
         FROM member_activities ma
         JOIN members m ON ma.member_id = m.id
         WHERE m.organization_id = ? ${dateFilter}
         GROUP BY activity_type, DATE_FORMAT(activity_date, '%Y-%m')
         ORDER BY month, activity_type`,
        [organizationId, ...dateParams]
    );

    // Most active members
    const [activeMembers] = await connection.execute(
        `SELECT 
            CONCAT(m.first_name, ' ', m.last_name) as member_name,
            COUNT(ma.id) as activity_count,
            GROUP_CONCAT(DISTINCT ma.activity_type) as activities
         FROM members m
         JOIN member_activities ma ON m.id = ma.member_id
         WHERE m.organization_id = ? ${dateFilter}
         GROUP BY m.id, member_name
         ORDER BY activity_count DESC
         LIMIT 10`,
        [organizationId, ...dateParams]
    );

    // Engagement by member type
    const [engagementByType] = await connection.execute(
        `SELECT 
            m.member_type,
            COUNT(ma.id) as total_activities,
            COUNT(DISTINCT m.id) as active_members,
            ROUND(COUNT(ma.id) / COUNT(DISTINCT m.id), 2) as avg_activities_per_member
         FROM members m
         LEFT JOIN member_activities ma ON m.id = ma.member_id ${dateFilter.replace('activity_date', 'ma.activity_date')}
         WHERE m.organization_id = ? AND m.status = 'active'
         GROUP BY m.member_type`,
        [organizationId, ...dateParams]
    );

    // Message engagement (opens, responses, etc.)
    const [messageEngagement] = await connection.execute(
        `SELECT 
            DATE_FORMAT(mr.sent_at, '%Y-%m') as month,
            COUNT(mr.id) as total_sent,
            COUNT(CASE WHEN mr.status = 'delivered' THEN 1 END) as delivered,
            ROUND((COUNT(CASE WHEN mr.status = 'delivered' THEN 1 END) / COUNT(mr.id)) * 100, 2) as delivery_rate
         FROM message_recipients mr
         JOIN messages m ON mr.message_id = m.id
         WHERE m.organization_id = ? AND mr.sent_at IS NOT NULL ${dateFilter.replace('activity_date', 'mr.sent_at')}
         GROUP BY DATE_FORMAT(mr.sent_at, '%Y-%m')
         ORDER BY month`,
        [organizationId, ...dateParams]
    );

    return apiResponse(res, {
        activityEngagement,
        activeMembers,
        engagementByType,
        messageEngagement
    });
}
