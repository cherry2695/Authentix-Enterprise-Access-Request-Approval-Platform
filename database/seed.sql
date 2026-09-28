-- ============================================================
-- AccessFlow - demo seed data
-- Password for ALL demo accounts: Password123!
-- Run AFTER schema.sql.
-- ============================================================

USE accessflow;

-- Demo users: 1 admin, 1 manager, 2 employees reporting to the manager
INSERT INTO users (id, full_name, email, password_hash, role, manager_id, active, created_at, updated_at) VALUES
(1, 'Ava Administrator', 'admin@accessflow.io',   '$2b$10$A1kAjMlaHdhRVYDuEWoXuO36CtZUsKRHCN.i.FeLKA5FaHVt9gF7K', 'ADMIN',    NULL, TRUE, NOW(), NOW()),
(2, 'Mia Manager',       'manager@accessflow.io', '$2b$10$MWvm3PFfWp08CtV9T.GxF.BdJSNpuSR7EPeEuTknxxSDuzYrRw.ZK', 'MANAGER',  NULL, TRUE, NOW(), NOW()),
(3, 'Ethan Employee',    'employee@accessflow.io','$2b$10$bWqsNO7xI0konxVALHFbBec8jtVHk3bxdU3hsFGFXtEb3wGq0KsMe', 'EMPLOYEE', 2,    TRUE, NOW(), NOW()),
(4, 'Priya Patel',       'priya@accessflow.io',   '$2b$10$bWqsNO7xI0konxVALHFbBec8jtVHk3bxdU3hsFGFXtEb3wGq0KsMe', 'EMPLOYEE', 2,    TRUE, NOW(), NOW());

-- Applications
INSERT INTO applications (id, name, description, category, owner_id, active, created_at) VALUES
(1, 'CRM',              'Customer relationship management system',            'Sales',    1, TRUE, NOW()),
(2, 'HRMS',              'Human resources management system',                'HR',       1, TRUE, NOW()),
(3, 'Finance Portal',    'Budgeting, invoicing and expense management portal', 'Finance',  1, TRUE, NOW()),
(4, 'Project Management System', 'Project and task tracking tool',            'Operations',1, TRUE, NOW());

-- Application roles (access levels)
INSERT INTO application_roles (id, application_id, role_name, description, active) VALUES
(1, 1, 'VIEWER', 'Read-only access to customer records', TRUE),
(2, 1, 'EDITOR', 'Can create and edit customer records', TRUE),
(3, 1, 'ADMIN',  'Full administrative access to CRM',    TRUE),
(4, 2, 'VIEWER', 'Read-only access to HR records',       TRUE),
(5, 2, 'EDITOR', 'Can manage employee records',          TRUE),
(6, 3, 'VIEWER', 'Read-only access to financial reports',TRUE),
(7, 3, 'EDITOR', 'Can create invoices and expense reports', TRUE),
(8, 4, 'VIEWER', 'Read-only access to project boards',   TRUE),
(9, 4, 'EDITOR', 'Can create and update tasks',          TRUE);

-- A sample in-flight access request awaiting manager approval
INSERT INTO access_requests (id, requester_id, application_id, application_role_id, justification, status, assigned_manager_id, submitted_at, updated_at) VALUES
(1, 3, 1, 2, 'I need edit access to CRM to update customer contact details for the Q4 renewal campaign.', 'PENDING_MANAGER_APPROVAL', 2, NOW(), NOW());
