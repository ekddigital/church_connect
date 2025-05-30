-- ChurchConnect Database Schema
-- MySQL Database for welfare ministry management

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS message_recipients;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS automation_rules;
DROP TABLE IF EXISTS automation_logs;
DROP TABLE IF EXISTS member_activities;
DROP TABLE IF EXISTS member_notes;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS message_templates;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS users;

-- Users table (authentication and basic info)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    role ENUM('super_admin', 'admin', 'pastor', 'leader', 'member') DEFAULT 'member',
    organization_id VARCHAR(36),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_organization (organization_id),
    INDEX idx_role (role)
);

-- Organizations table (churches/ministries)
CREATE TABLE organizations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    pastor_name VARCHAR(100),
    denomination VARCHAR(100),
    member_count INT DEFAULT 0,
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Members table (congregation members)
CREATE TABLE members (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    organization_id VARCHAR(36) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    marital_status ENUM('single', 'married', 'divorced', 'widowed'),
    member_since DATE,
    member_type ENUM('regular', 'visitor', 'new_convert', 'leader') DEFAULT 'regular',
    status ENUM('active', 'inactive', 'transferred', 'deceased') DEFAULT 'active',
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    notes TEXT,
    tags JSON, -- For categorization (youth, elderly, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    INDEX idx_organization (organization_id),
    INDEX idx_name (first_name, last_name),
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_status (status),
    INDEX idx_member_type (member_type)
);

-- Member notes for welfare tracking
CREATE TABLE member_notes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    member_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    note_type ENUM('general', 'pastoral_care', 'prayer_request', 'visitation', 'counseling', 'emergency') DEFAULT 'general',
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_member (member_id),
    INDEX idx_user (user_id),
    INDEX idx_type (note_type),
    INDEX idx_date (created_at)
);

-- Member activities tracking
CREATE TABLE member_activities (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    member_id VARCHAR(36) NOT NULL,
    activity_type ENUM('attendance', 'baptism', 'communion', 'prayer_meeting', 'bible_study', 'outreach', 'counseling', 'visit') NOT NULL,
    activity_date DATE NOT NULL,
    description TEXT,
    recorded_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_member (member_id),
    INDEX idx_type (activity_type),
    INDEX idx_date (activity_date),
    INDEX idx_recorded_by (recorded_by)
);

-- Message templates for communication
CREATE TABLE message_templates (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    organization_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    template_type ENUM('email', 'sms', 'notification') NOT NULL,
    category ENUM('welcome', 'birthday', 'anniversary', 'prayer', 'announcement', 'reminder', 'care') DEFAULT 'announcement',
    variables JSON, -- Template variables like {name}, {date}, etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_organization (organization_id),
    INDEX idx_type (template_type),
    INDEX idx_category (category),
    INDEX idx_active (is_active)
);

-- Messages sent to members
CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    organization_id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    template_id VARCHAR(36),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    message_type ENUM('email', 'sms', 'notification') NOT NULL,
    send_method ENUM('immediate', 'scheduled', 'automated') DEFAULT 'immediate',
    scheduled_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    status ENUM('draft', 'scheduled', 'sending', 'sent', 'failed') DEFAULT 'draft',
    recipient_count INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES message_templates(id) ON DELETE SET NULL,
    INDEX idx_organization (organization_id),
    INDEX idx_sender (sender_id),
    INDEX idx_status (status),
    INDEX idx_type (message_type),
    INDEX idx_scheduled (scheduled_at),
    INDEX idx_sent (sent_at)
);

-- Message recipients tracking
CREATE TABLE message_recipients (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    message_id VARCHAR(36) NOT NULL,
    member_id VARCHAR(36) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    status ENUM('pending', 'sent', 'delivered', 'failed', 'bounced') DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX idx_message (message_id),
    INDEX idx_member (member_id),
    INDEX idx_status (status),
    UNIQUE KEY unique_message_member (message_id, member_id)
);

-- Automation rules for automatic messaging/actions
CREATE TABLE automation_rules (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    organization_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type ENUM('birthday', 'anniversary', 'new_member', 'attendance_absence', 'date_based', 'manual') NOT NULL,
    trigger_conditions JSON, -- Conditions for when to trigger
    action_type ENUM('send_message', 'create_note', 'assign_task', 'notification') NOT NULL,
    action_config JSON, -- Configuration for the action
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_organization (organization_id),
    INDEX idx_trigger (trigger_type),
    INDEX idx_active (is_active)
);

-- Automation execution logs
CREATE TABLE automation_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    rule_id VARCHAR(36) NOT NULL,
    member_id VARCHAR(36),
    execution_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('success', 'failed', 'skipped') NOT NULL,
    result_data JSON,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rule_id) REFERENCES automation_rules(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX idx_rule (rule_id),
    INDEX idx_member (member_id),
    INDEX idx_status (status),
    INDEX idx_date (execution_date)
);

-- Add foreign key constraint for users.organization_id
ALTER TABLE users ADD CONSTRAINT fk_users_organization 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- Insert default organization for initial setup
INSERT INTO organizations (id, name, address, email, pastor_name, denomination) VALUES 
('00000000-0000-0000-0000-000000000001', 'Sample Church', '123 Main St, City, State', 'info@samplechurch.org', 'Pastor John', 'Non-denominational');

-- Insert default admin user (password: admin123 - change this!)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (id, email, password_hash, display_name, role, organization_id) VALUES 
('00000000-0000-0000-0000-000000000001', 'admin@churchconnect.com', '$2b$10$K7L/T7rAJ7w8J7w8J7w8JOq7rAJ7w8J7w8J7w8J7w8J7w8J7w8J7w8', 'System Administrator', 'admin', '00000000-0000-0000-0000-000000000001');
