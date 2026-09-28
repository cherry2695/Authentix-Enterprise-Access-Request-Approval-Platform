// Baseline Mock Data mirroring the backend MySQL database
export const MOCK_USERS = [
  { id: 1, fullName: 'Ava Administrator', email: 'admin@accessflow.io', role: 'ADMIN', managerId: null, managerName: null, active: true },
  { id: 2, fullName: 'Mia Manager', email: 'manager@accessflow.io', role: 'MANAGER', managerId: null, managerName: null, active: true },
  { id: 3, fullName: 'Ethan Employee', email: 'employee@accessflow.io', role: 'EMPLOYEE', managerId: 2, managerName: 'Mia Manager', active: true },
  { id: 4, fullName: 'Priya Patel', email: 'priya@accessflow.io', role: 'EMPLOYEE', managerId: 2, managerName: 'Mia Manager', active: true }
];

export const MOCK_APPLICATIONS = [
  {
    id: 1,
    name: 'CRM',
    description: 'Customer relationship management system for sales and customer success teams',
    category: 'Sales',
    ownerId: 1,
    active: true,
    roles: [
      { id: 1, applicationId: 1, roleName: 'VIEWER', description: 'Read-only access to customer records', active: true },
      { id: 2, applicationId: 1, roleName: 'EDITOR', description: 'Can create and edit customer records and deals', active: true },
      { id: 3, applicationId: 1, roleName: 'ADMIN', description: 'Full administrative access to CRM', active: true }
    ]
  },
  {
    id: 2,
    name: 'HRMS',
    description: 'Human resources management system for employee records, payroll, and benefits',
    category: 'HR',
    ownerId: 1,
    active: true,
    roles: [
      { id: 4, applicationId: 2, roleName: 'VIEWER', description: 'Read-only access to HR records', active: true },
      { id: 5, applicationId: 2, roleName: 'EDITOR', description: 'Can manage employee records and leave requests', active: true }
    ]
  },
  {
    id: 3,
    name: 'Finance Portal',
    description: 'Budgeting, invoicing, vendor payments, and quarterly expense management portal',
    category: 'Finance',
    ownerId: 1,
    active: true,
    roles: [
      { id: 6, applicationId: 3, roleName: 'VIEWER', description: 'Read-only access to financial reports and ledgers', active: true },
      { id: 7, applicationId: 3, roleName: 'EDITOR', description: 'Can create invoices and expense reports', active: true }
    ]
  },
  {
    id: 4,
    name: 'Project Management System',
    description: 'Agile sprint and task tracking tool across engineering and product divisions',
    category: 'Operations',
    ownerId: 1,
    active: true,
    roles: [
      { id: 8, applicationId: 4, roleName: 'VIEWER', description: 'Read-only access to project boards', active: true },
      { id: 9, applicationId: 4, roleName: 'EDITOR', description: 'Can create and update sprint tasks', active: true }
    ]
  }
];

export let mockRequests = [
  {
    id: 1,
    requesterId: 3,
    requesterName: 'Ethan Employee',
    applicationId: 1,
    applicationName: 'CRM',
    applicationRoleId: 2,
    roleName: 'EDITOR',
    justification: 'Need edit access to update customer contact details for the Q4 renewal campaign.',
    status: 'PENDING_MANAGER_APPROVAL',
    assignedManagerId: 2,
    assignedManagerName: 'Mia Manager',
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    expiresAt: null
  },
  {
    id: 2,
    requesterId: 4,
    requesterName: 'Priya Patel',
    applicationId: 3,
    applicationName: 'Finance Portal',
    applicationRoleId: 6,
    roleName: 'VIEWER',
    justification: 'Require view access to Finance Portal to review vendor payment vouchers for department audit.',
    status: 'PENDING_ADMIN_APPROVAL',
    assignedManagerId: 2,
    assignedManagerName: 'Mia Manager',
    submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    expiresAt: null
  },
  {
    id: 3,
    requesterId: 3,
    requesterName: 'Ethan Employee',
    applicationId: 4,
    applicationName: 'Project Management System',
    applicationRoleId: 9,
    roleName: 'EDITOR',
    justification: 'Leading sprint planning and task assignment for the AccessFlow frontend project.',
    status: 'ACCESS_GRANTED',
    assignedManagerId: 2,
    assignedManagerName: 'Mia Manager',
    submittedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    expiresAt: null
  }
];

export let mockApprovalHistory = [
  {
    id: 1,
    accessRequestId: 2,
    approverId: 2,
    approverName: 'Mia Manager',
    approverEmail: 'manager@accessflow.io',
    approvalStage: 'MANAGER',
    decision: 'APPROVED',
    comments: 'Approved. Priya is leading the quarterly vendor reconciliation audit.',
    decidedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 2,
    accessRequestId: 3,
    approverId: 2,
    approverName: 'Mia Manager',
    approverEmail: 'manager@accessflow.io',
    approvalStage: 'MANAGER',
    decision: 'APPROVED',
    comments: 'Verified team lead requirement.',
    decidedAt: new Date(Date.now() - 3600000 * 55).toISOString()
  },
  {
    id: 3,
    accessRequestId: 3,
    approverId: 1,
    approverName: 'Ava Administrator',
    approverEmail: 'admin@accessflow.io',
    approvalStage: 'ADMIN',
    decision: 'APPROVED',
    comments: 'Administrative approval granted. Access provisioned.',
    decidedAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

export let mockPermissions = [
  {
    id: 1,
    userId: 3,
    userName: 'Ethan Employee',
    userEmail: 'employee@accessflow.io',
    applicationId: 1,
    applicationName: 'CRM',
    applicationCategory: 'Sales',
    applicationRoleId: 1,
    roleName: 'VIEWER',
    accessRequestId: null,
    grantedById: 1,
    grantedByName: 'Ava Administrator',
    grantedAt: new Date(Date.now() - 3600000 * 240).toISOString(),
    expiresAt: null,
    revokedAt: null,
    status: 'ACTIVE'
  },
  {
    id: 2,
    userId: 3,
    userName: 'Ethan Employee',
    userEmail: 'employee@accessflow.io',
    applicationId: 4,
    applicationName: 'Project Management System',
    applicationCategory: 'Operations',
    applicationRoleId: 9,
    roleName: 'EDITOR',
    accessRequestId: 3,
    grantedById: 1,
    grantedByName: 'Ava Administrator',
    grantedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    expiresAt: null,
    revokedAt: null,
    status: 'ACTIVE'
  },
  {
    id: 3,
    userId: 4,
    userName: 'Priya Patel',
    userEmail: 'priya@accessflow.io',
    applicationId: 2,
    applicationName: 'HRMS',
    applicationCategory: 'HR',
    applicationRoleId: 4,
    roleName: 'VIEWER',
    accessRequestId: null,
    grantedById: 1,
    grantedByName: 'Ava Administrator',
    grantedAt: new Date(Date.now() - 3600000 * 180).toISOString(),
    expiresAt: null,
    revokedAt: null,
    status: 'ACTIVE'
  }
];

export let mockNotifications = [
  {
    id: 1,
    userId: 3,
    title: 'Access Granted',
    message: 'Access granted! You now have EDITOR access to Project Management System.',
    notificationType: 'ACCESS_GRANTED',
    referenceId: 3,
    readStatus: false,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 2,
    userId: 2,
    title: 'New Approval Required',
    message: 'Ethan Employee has requested EDITOR access to CRM.',
    notificationType: 'REQUEST_SUBMITTED',
    referenceId: 1,
    readStatus: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 3,
    userId: 1,
    title: 'Admin Review Required',
    message: 'Request #2 from Priya Patel for Finance Portal is awaiting admin approval.',
    notificationType: 'REQUEST_APPROVED',
    referenceId: 2,
    readStatus: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

export let mockAuditLogs = [
  {
    id: 1,
    actorId: 3,
    actorName: 'Ethan Employee',
    actorEmail: 'employee@accessflow.io',
    action: 'ACCESS_REQUEST_CREATED',
    entityType: 'AccessRequest',
    entityId: 1,
    oldValue: null,
    newValue: 'PENDING_MANAGER_APPROVAL',
    reason: 'I need edit access to CRM to update customer contact details.',
    correlationId: 'req-c7a829',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 2,
    actorId: 2,
    actorName: 'Mia Manager',
    actorEmail: 'manager@accessflow.io',
    action: 'MANAGER_APPROVED',
    entityType: 'AccessRequest',
    entityId: 2,
    oldValue: 'PENDING_MANAGER_APPROVAL',
    newValue: 'PENDING_ADMIN_APPROVAL',
    reason: 'Approved. Priya is leading the quarterly vendor reconciliation audit.',
    correlationId: 'appr-82f91a',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 3,
    actorId: 1,
    actorName: 'Ava Administrator',
    actorEmail: 'admin@accessflow.io',
    action: 'PERMISSION_GRANTED',
    entityType: 'UserPermission',
    entityId: 2,
    oldValue: null,
    newValue: 'ACTIVE',
    reason: 'Granted via access request #3',
    correlationId: 'perm-99b31d',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 4,
    actorId: 1,
    actorName: 'Ava Administrator',
    actorEmail: 'admin@accessflow.io',
    action: 'ADMIN_APPROVED',
    entityType: 'AccessRequest',
    entityId: 3,
    oldValue: 'PENDING_ADMIN_APPROVAL',
    newValue: 'ACCESS_GRANTED',
    reason: 'Administrative approval granted. Access provisioned.',
    correlationId: 'adm-34x882',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

export let mockCampaigns = [
  {
    id: 1,
    campaignName: 'Q4 2026 Enterprise Access Certification',
    description: 'Quarterly compliance and security audit of active permissions across CRM, HRMS, and Finance Portal.',
    createdById: 1,
    createdByName: 'Ava Administrator',
    startDate: '2026-10-01',
    dueDate: '2026-10-31',
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    totalItems: 3,
    pendingItems: 2,
    approvedItems: 1,
    revokedItems: 0,
    items: [
      {
        id: 1,
        reviewId: 1,
        permissionId: 1,
        userId: 3,
        userName: 'Ethan Employee',
        userEmail: 'employee@accessflow.io',
        applicationName: 'CRM',
        roleName: 'VIEWER',
        reviewerId: 2,
        reviewerName: 'Mia Manager',
        decision: 'APPROVED_RETAIN',
        comments: 'Still required for daily support queries.',
        reviewedAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 2,
        reviewId: 1,
        permissionId: 2,
        userId: 3,
        userName: 'Ethan Employee',
        userEmail: 'employee@accessflow.io',
        applicationName: 'Project Management System',
        roleName: 'EDITOR',
        reviewerId: null,
        reviewerName: null,
        decision: 'PENDING',
        comments: null,
        reviewedAt: null
      },
      {
        id: 3,
        reviewId: 1,
        permissionId: 3,
        userId: 4,
        userName: 'Priya Patel',
        userEmail: 'priya@accessflow.io',
        applicationName: 'HRMS',
        roleName: 'VIEWER',
        reviewerId: null,
        reviewerName: null,
        decision: 'PENDING',
        comments: null,
        reviewedAt: null
      }
    ]
  }
];
