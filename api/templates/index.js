const { createConnection } = require("../_lib/database");
const { verifyToken, hasPermission } = require("../_lib/auth");
const { apiResponse, apiError } = require("../_lib/response");

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
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
      case "GET":
        return await getTemplates(req, res, connection, currentUser);
      case "POST":
        return await createTemplate(req, res, connection, currentUser);
      case "PUT":
        return await updateTemplate(req, res, connection, currentUser);
      case "DELETE":
        return await deleteTemplate(req, res, connection, currentUser);
      default:
        return apiError(res, "Method not allowed", 405);
    }
  } catch (error) {
    console.error("Templates API error:", error);
    return apiError(res, "Internal server error", 500);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function getTemplates(req, res, connection, currentUser) {
  const {
    page = 1,
    limit = 20,
    templateType,
    category,
    isActive,
    organizationId,
  } = req.query;

  const offset = (page - 1) * limit;

  let whereClause = "WHERE 1=1";
  const params = [];

  // Filter by organization
  const targetOrgId =
    currentUser.role === "admin" && organizationId
      ? organizationId
      : currentUser.organizationId;

  if (targetOrgId) {
    whereClause += " AND t.organization_id = ?";
    params.push(targetOrgId);
  }

  // Template type filter
  if (templateType) {
    whereClause += " AND t.template_type = ?";
    params.push(templateType);
  }

  // Category filter
  if (category) {
    whereClause += " AND t.category = ?";
    params.push(category);
  }

  // Active status filter
  if (isActive !== undefined) {
    whereClause += " AND t.is_active = ?";
    params.push(isActive === "true");
  }

  // Get total count
  const [countResult] = await connection.execute(
    `SELECT COUNT(*) as total FROM message_templates t ${whereClause}`,
    params
  );
  const total = countResult[0].total;

  // Get templates with pagination
  const [templates] = await connection.execute(
    `SELECT t.*, u.display_name as created_by_name, o.name as organization_name
         FROM message_templates t
         LEFT JOIN users u ON t.created_by = u.id
         LEFT JOIN organizations o ON t.organization_id = o.id
         ${whereClause}
         ORDER BY t.created_at DESC
         LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), offset]
  );

  const templateData = templates.map((template) => ({
    id: template.id,
    organizationId: template.organization_id,
    organizationName: template.organization_name,
    name: template.name,
    subject: template.subject,
    content: template.content,
    templateType: template.template_type,
    category: template.category,
    variables: template.variables ? JSON.parse(template.variables) : [],
    isActive: template.is_active,
    createdBy: template.created_by,
    createdByName: template.created_by_name,
    createdAt: template.created_at,
    updatedAt: template.updated_at,
  }));

  return apiResponse(res, {
    templates: templateData,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

async function createTemplate(req, res, connection, currentUser) {
  // Check permissions
  if (!hasPermission(currentUser.role, ["admin", "pastor", "leader"])) {
    return apiError(res, "Insufficient permissions", 403);
  }

  const {
    name,
    subject,
    content,
    templateType,
    category = "announcement",
    variables = [],
  } = req.body;

  // Validation
  if (!name || !content || !templateType) {
    return apiError(res, "Name, content, and template type are required", 400);
  }

  if (!["email", "sms", "notification"].includes(templateType)) {
    return apiError(res, "Invalid template type", 400);
  }

  if (
    ![
      "welcome",
      "birthday",
      "anniversary",
      "prayer",
      "announcement",
      "reminder",
      "care",
    ].includes(category)
  ) {
    return apiError(res, "Invalid category", 400);
  }

  // Set organization
  const organizationId = currentUser.organizationId;
  if (!organizationId) {
    return apiError(res, "Organization ID is required", 400);
  }

  // Check for duplicate name in organization
  const [existingTemplates] = await connection.execute(
    "SELECT id FROM message_templates WHERE name = ? AND organization_id = ?",
    [name, organizationId]
  );

  if (existingTemplates.length > 0) {
    return apiError(
      res,
      "Template with this name already exists in this organization",
      409
    );
  }

  // Create template
  const templateId = require("crypto").randomUUID();
  await connection.execute(
    `INSERT INTO message_templates (
            id, organization_id, name, subject, content, template_type,
            category, variables, is_active, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      templateId,
      organizationId,
      name,
      subject,
      content,
      templateType,
      category,
      variables.length > 0 ? JSON.stringify(variables) : null,
      true,
      currentUser.userId,
    ]
  );

  // Get created template data
  const [newTemplate] = await connection.execute(
    `SELECT t.*, u.display_name as created_by_name, o.name as organization_name
         FROM message_templates t
         LEFT JOIN users u ON t.created_by = u.id
         LEFT JOIN organizations o ON t.organization_id = o.id
         WHERE t.id = ?`,
    [templateId]
  );

  const templateData = {
    id: newTemplate[0].id,
    organizationId: newTemplate[0].organization_id,
    organizationName: newTemplate[0].organization_name,
    name: newTemplate[0].name,
    subject: newTemplate[0].subject,
    content: newTemplate[0].content,
    templateType: newTemplate[0].template_type,
    category: newTemplate[0].category,
    variables: newTemplate[0].variables
      ? JSON.parse(newTemplate[0].variables)
      : [],
    isActive: newTemplate[0].is_active,
    createdBy: newTemplate[0].created_by,
    createdByName: newTemplate[0].created_by_name,
    createdAt: newTemplate[0].created_at,
    updatedAt: newTemplate[0].updated_at,
  };

  return apiResponse(
    res,
    {
      message: "Template created successfully",
      template: templateData,
    },
    201
  );
}

async function updateTemplate(req, res, connection, currentUser) {
  const { id } = req.query;
  if (!id) {
    return apiError(res, "Template ID is required", 400);
  }

  // Get existing template
  const [existingTemplates] = await connection.execute(
    "SELECT * FROM message_templates WHERE id = ?",
    [id]
  );

  if (existingTemplates.length === 0) {
    return apiError(res, "Template not found", 404);
  }

  const existingTemplate = existingTemplates[0];

  // Check permissions
  if (
    currentUser.userId !== existingTemplate.created_by &&
    !hasPermission(currentUser.role, ["admin", "pastor"])
  ) {
    return apiError(res, "Insufficient permissions", 403);
  }

  // Check organization access
  if (
    currentUser.role !== "admin" &&
    existingTemplate.organization_id !== currentUser.organizationId
  ) {
    return apiError(
      res,
      "Cannot modify templates from other organizations",
      403
    );
  }

  const {
    name,
    subject,
    content,
    templateType,
    category,
    variables,
    isActive,
  } = req.body;

  // Build update query
  const updateFields = [];
  const params = [];

  if (name !== undefined) {
    // Check for duplicate name
    const [duplicates] = await connection.execute(
      "SELECT id FROM message_templates WHERE name = ? AND organization_id = ? AND id != ?",
      [name, existingTemplate.organization_id, id]
    );

    if (duplicates.length > 0) {
      return apiError(
        res,
        "Template with this name already exists in this organization",
        409
      );
    }

    updateFields.push("name = ?");
    params.push(name);
  }
  if (subject !== undefined) {
    updateFields.push("subject = ?");
    params.push(subject);
  }
  if (content !== undefined) {
    updateFields.push("content = ?");
    params.push(content);
  }
  if (
    templateType !== undefined &&
    ["email", "sms", "notification"].includes(templateType)
  ) {
    updateFields.push("template_type = ?");
    params.push(templateType);
  }
  if (
    category !== undefined &&
    [
      "welcome",
      "birthday",
      "anniversary",
      "prayer",
      "announcement",
      "reminder",
      "care",
    ].includes(category)
  ) {
    updateFields.push("category = ?");
    params.push(category);
  }
  if (variables !== undefined) {
    updateFields.push("variables = ?");
    params.push(variables ? JSON.stringify(variables) : null);
  }
  if (isActive !== undefined) {
    updateFields.push("is_active = ?");
    params.push(isActive);
  }

  if (updateFields.length === 0) {
    return apiError(res, "No valid fields to update", 400);
  }

  updateFields.push("updated_at = CURRENT_TIMESTAMP");
  params.push(id);

  // Update template
  await connection.execute(
    `UPDATE message_templates SET ${updateFields.join(", ")} WHERE id = ?`,
    params
  );

  // Get updated template data
  const [updatedTemplate] = await connection.execute(
    `SELECT t.*, u.display_name as created_by_name, o.name as organization_name
         FROM message_templates t
         LEFT JOIN users u ON t.created_by = u.id
         LEFT JOIN organizations o ON t.organization_id = o.id
         WHERE t.id = ?`,
    [id]
  );

  const templateData = {
    id: updatedTemplate[0].id,
    organizationId: updatedTemplate[0].organization_id,
    organizationName: updatedTemplate[0].organization_name,
    name: updatedTemplate[0].name,
    subject: updatedTemplate[0].subject,
    content: updatedTemplate[0].content,
    templateType: updatedTemplate[0].template_type,
    category: updatedTemplate[0].category,
    variables: updatedTemplate[0].variables
      ? JSON.parse(updatedTemplate[0].variables)
      : [],
    isActive: updatedTemplate[0].is_active,
    createdBy: updatedTemplate[0].created_by,
    createdByName: updatedTemplate[0].created_by_name,
    createdAt: updatedTemplate[0].created_at,
    updatedAt: updatedTemplate[0].updated_at,
  };

  return apiResponse(res, {
    message: "Template updated successfully",
    template: templateData,
  });
}

async function deleteTemplate(req, res, connection, currentUser) {
  const { id } = req.query;
  if (!id) {
    return apiError(res, "Template ID is required", 400);
  }

  // Get template
  const [templates] = await connection.execute(
    "SELECT created_by, organization_id FROM message_templates WHERE id = ?",
    [id]
  );

  if (templates.length === 0) {
    return apiError(res, "Template not found", 404);
  }

  const template = templates[0];

  // Check permissions
  if (
    currentUser.userId !== template.created_by &&
    !hasPermission(currentUser.role, ["admin", "pastor"])
  ) {
    return apiError(res, "Insufficient permissions", 403);
  }

  // Check organization access
  if (
    currentUser.role !== "admin" &&
    template.organization_id !== currentUser.organizationId
  ) {
    return apiError(
      res,
      "Cannot delete templates from other organizations",
      403
    );
  }

  // Check if template is being used by any messages
  const [messagesUsingTemplate] = await connection.execute(
    "SELECT COUNT(*) as count FROM messages WHERE template_id = ?",
    [id]
  );

  if (messagesUsingTemplate[0].count > 0) {
    return apiError(
      res,
      "Cannot delete template that is being used by messages",
      400
    );
  }

  // Delete template
  await connection.execute("DELETE FROM message_templates WHERE id = ?", [id]);

  return apiResponse(res, {
    message: "Template deleted successfully",
  });
}
