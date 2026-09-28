import axios from 'axios';
import {
  MOCK_USERS,
  MOCK_APPLICATIONS,
  mockRequests,
  mockApprovalHistory,
  mockPermissions,
  mockNotifications,
  mockAuditLogs,
  mockCampaigns
} from './mockData';

const API_BASE = '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 4000
});

// Request interceptor: attach JWT token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessflow_token');
      localStorage.removeItem('accessflow_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper to execute API call with offline mock fallback
async function callWithFallback(apiFn, mockFallbackFn) {
  try {
    const res = await apiFn();
    return res.data;
  } catch (err) {
    // If backend is offline or network error, execute mock fallback
    if (!err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED' || err.response?.status === 404) {
      console.warn('Backend unavailable, serving via interactive mock mode:', err.message);
      return await mockFallbackFn();
    }
    throw err;
  }
}

export const api = {
  auth: {
    login: async (email, password) => {
      return callWithFallback(
        () => apiClient.post('/auth/login', { email, password }),
        async () => {
          const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (!user || password !== 'Password123!') {
            throw new Error('Invalid email or password. (Demo password: Password123!)');
          }
          return {
            token: 'mock-jwt-token-' + user.role.toLowerCase() + '-' + Date.now(),
            user: {
              id: user.id,
              fullName: user.fullName,
              email: user.email,
              role: user.role,
              managerId: user.managerId,
              managerName: user.managerName,
              active: user.active
            }
          };
        }
      );
    },
    register: async (fullName, email, password) => {
      return callWithFallback(
        () => apiClient.post('/auth/register', { fullName, email, password }),
        async () => {
          const newUser = {
            id: MOCK_USERS.length + 1,
            fullName,
            email,
            role: 'EMPLOYEE',
            managerId: 2,
            managerName: 'Mia Manager',
            active: true
          };
          MOCK_USERS.push(newUser);
          return {
            token: 'mock-jwt-token-registered-' + Date.now(),
            user: newUser
          };
        }
      );
    },
    me: async () => {
      return callWithFallback(
        () => apiClient.get('/auth/me'),
        async () => {
          const stored = localStorage.getItem('accessflow_user');
          return stored ? JSON.parse(stored) : MOCK_USERS[0];
        }
      );
    }
  },

  applications: {
    getAll: async (category = '', search = '') => {
      return callWithFallback(
        () => apiClient.get('/applications', { params: { category, search } }),
        async () => {
          let list = [...MOCK_APPLICATIONS];
          if (category) list = list.filter(a => a.category.toLowerCase() === category.toLowerCase());
          if (search) list = list.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()));
          return list;
        }
      );
    },
    getById: async (id) => {
      return callWithFallback(
        () => apiClient.get(`/applications/${id}`),
        async () => MOCK_APPLICATIONS.find(a => a.id === Number(id))
      );
    },
    getRoles: async (id) => {
      return callWithFallback(
        () => apiClient.get(`/applications/${id}/roles`),
        async () => {
          const app = MOCK_APPLICATIONS.find(a => a.id === Number(id));
          return app ? app.roles : [];
        }
      );
    },
    create: async (data) => {
      return callWithFallback(
        () => apiClient.post('/applications', data),
        async () => {
          const newApp = { id: MOCK_APPLICATIONS.length + 1, ...data, active: true, roles: [] };
          MOCK_APPLICATIONS.push(newApp);
          return newApp;
        }
      );
    },
    addRole: async (appId, roleData) => {
      return callWithFallback(
        () => apiClient.post(`/applications/${appId}/roles`, roleData),
        async () => {
          const app = MOCK_APPLICATIONS.find(a => a.id === Number(appId));
          const newRole = { id: Date.now(), applicationId: Number(appId), ...roleData, active: true };
          if (app) app.roles.push(newRole);
          return newRole;
        }
      );
    }
  },

  requests: {
    create: async (data) => {
      return callWithFallback(
        () => apiClient.post('/access-requests', data),
        async () => {
          const app = MOCK_APPLICATIONS.find(a => a.id === Number(data.applicationId));
          const role = app ? app.roles.find(r => r.id === Number(data.applicationRoleId)) : null;
          const userStr = localStorage.getItem('accessflow_user');
          const user = userStr ? JSON.parse(userStr) : MOCK_USERS[2];

          const newReq = {
            id: mockRequests.length + 1,
            requesterId: user.id,
            requesterName: user.fullName,
            applicationId: data.applicationId,
            applicationName: app ? app.name : 'Application',
            applicationRoleId: data.applicationRoleId,
            roleName: role ? role.roleName : 'ACCESS',
            justification: data.justification,
            status: 'PENDING_MANAGER_APPROVAL',
            assignedManagerId: user.managerId || 2,
            assignedManagerName: user.managerName || 'Mia Manager',
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            expiresAt: null
          };
          mockRequests.unshift(newReq);
          return newReq;
        }
      );
    },
    getMy: async () => {
      return callWithFallback(
        () => apiClient.get('/access-requests/my'),
        async () => {
          const userStr = localStorage.getItem('accessflow_user');
          const user = userStr ? JSON.parse(userStr) : MOCK_USERS[2];
          return mockRequests.filter(r => r.requesterId === user.id);
        }
      );
    },
    getAll: async (status = '') => {
      return callWithFallback(
        () => apiClient.get('/access-requests', { params: { status } }),
        async () => {
          if (!status) return { content: mockRequests, totalElements: mockRequests.length };
          const filtered = mockRequests.filter(r => r.status === status);
          return { content: filtered, totalElements: filtered.length };
        }
      );
    },
    getById: async (id) => {
      return callWithFallback(
        () => apiClient.get(`/access-requests/${id}`),
        async () => mockRequests.find(r => r.id === Number(id))
      );
    },
    cancel: async (id) => {
      return callWithFallback(
        () => apiClient.patch(`/access-requests/${id}/cancel`),
        async () => {
          const req = mockRequests.find(r => r.id === Number(id));
          if (req) req.status = 'CANCELLED';
          return req;
        }
      );
    }
  },

  approvals: {
    getPending: async () => {
      return callWithFallback(
        () => apiClient.get('/approvals/pending'),
        async () => {
          const userStr = localStorage.getItem('accessflow_user');
          const user = userStr ? JSON.parse(userStr) : MOCK_USERS[1];
          if (user.role === 'ADMIN') {
            return mockRequests.filter(r => r.status === 'PENDING_ADMIN_APPROVAL');
          }
          return mockRequests.filter(r => r.status === 'PENDING_MANAGER_APPROVAL' && r.assignedManagerId === user.id);
        }
      );
    },
    managerDecision: async (id, decision, comments) => {
      return callWithFallback(
        () => apiClient.post(`/approvals/${id}/manager-decision`, { decision, comments }),
        async () => {
          const req = mockRequests.find(r => r.id === Number(id));
          if (req) {
            req.status = decision === 'APPROVED' ? 'PENDING_ADMIN_APPROVAL' : 'REJECTED';
            req.updatedAt = new Date().toISOString();
            mockApprovalHistory.push({
              id: Date.now(),
              accessRequestId: req.id,
              approverId: 2,
              approverName: 'Mia Manager',
              approverEmail: 'manager@accessflow.io',
              approvalStage: 'MANAGER',
              decision,
              comments,
              decidedAt: new Date().toISOString()
            });
          }
          return req;
        }
      );
    },
    adminDecision: async (id, decision, comments) => {
      return callWithFallback(
        () => apiClient.post(`/approvals/${id}/admin-decision`, { decision, comments }),
        async () => {
          const req = mockRequests.find(r => r.id === Number(id));
          if (req) {
            req.status = decision === 'APPROVED' ? 'ACCESS_GRANTED' : 'REJECTED';
            req.updatedAt = new Date().toISOString();
            mockApprovalHistory.push({
              id: Date.now(),
              accessRequestId: req.id,
              approverId: 1,
              approverName: 'Ava Administrator',
              approverEmail: 'admin@accessflow.io',
              approvalStage: 'ADMIN',
              decision,
              comments,
              decidedAt: new Date().toISOString()
            });

            if (decision === 'APPROVED') {
              mockPermissions.push({
                id: Date.now(),
                userId: req.requesterId,
                userName: req.requesterName,
                userEmail: req.requesterName.toLowerCase().replace(' ', '.') + '@accessflow.io',
                applicationId: req.applicationId,
                applicationName: req.applicationName,
                applicationCategory: 'General',
                applicationRoleId: req.applicationRoleId,
                roleName: req.roleName,
                accessRequestId: req.id,
                grantedById: 1,
                grantedByName: 'Ava Administrator',
                grantedAt: new Date().toISOString(),
                expiresAt: null,
                revokedAt: null,
                status: 'ACTIVE'
              });
            }
          }
          return req;
        }
      );
    },
    getHistory: async (id) => {
      return callWithFallback(
        () => apiClient.get(`/approvals/${id}/history`),
        async () => mockApprovalHistory.filter(h => h.accessRequestId === Number(id))
      );
    },
    getTeam: async () => {
      return callWithFallback(
        () => apiClient.get('/approvals/team'),
        async () => mockRequests
      );
    }
  },

  permissions: {
    getAll: async (status = '') => {
      return callWithFallback(
        () => apiClient.get('/permissions', { params: { status } }),
        async () => {
          if (!status) return mockPermissions;
          return mockPermissions.filter(p => p.status === status);
        }
      );
    },
    getMy: async () => {
      return callWithFallback(
        () => apiClient.get('/permissions/my'),
        async () => {
          const userStr = localStorage.getItem('accessflow_user');
          const user = userStr ? JSON.parse(userStr) : MOCK_USERS[2];
          return mockPermissions.filter(p => p.userId === user.id);
        }
      );
    },
    revoke: async (id, reason) => {
      return callWithFallback(
        () => apiClient.post(`/permissions/${id}/revoke`, { reason }),
        async () => {
          const perm = mockPermissions.find(p => p.id === Number(id));
          if (perm) {
            perm.status = 'REVOKED';
            perm.revokedAt = new Date().toISOString();
          }
          return perm;
        }
      );
    }
  },

  audit: {
    search: async (params) => {
      return callWithFallback(
        () => apiClient.get('/audit-logs', { params }),
        async () => ({ content: mockAuditLogs, totalElements: mockAuditLogs.length })
      );
    },
    getRecent: async (limit = 10) => {
      return callWithFallback(
        () => apiClient.get('/audit-logs/recent', { params: { limit } }),
        async () => mockAuditLogs.slice(0, limit)
      );
    }
  },

  reviews: {
    getAll: async () => {
      return callWithFallback(
        () => apiClient.get('/access-reviews'),
        async () => mockCampaigns
      );
    },
    getById: async (id) => {
      return callWithFallback(
        () => apiClient.get(`/access-reviews/${id}`),
        async () => mockCampaigns.find(c => c.id === Number(id))
      );
    },
    getItems: async (id) => {
      return callWithFallback(
        () => apiClient.get(`/access-reviews/${id}/items`),
        async () => {
          const camp = mockCampaigns.find(c => c.id === Number(id));
          return camp ? camp.items : [];
        }
      );
    },
    create: async (data) => {
      return callWithFallback(
        () => apiClient.post('/access-reviews', data),
        async () => {
          const activePerms = mockPermissions.filter(p => p.status === 'ACTIVE');
          const newCamp = {
            id: mockCampaigns.length + 1,
            campaignName: data.campaignName,
            description: data.description,
            createdById: 1,
            createdByName: 'Ava Administrator',
            startDate: data.startDate,
            dueDate: data.dueDate,
            status: 'IN_PROGRESS',
            createdAt: new Date().toISOString(),
            totalItems: activePerms.length,
            pendingItems: activePerms.length,
            approvedItems: 0,
            revokedItems: 0,
            items: activePerms.map((p, idx) => ({
              id: Date.now() + idx,
              reviewId: mockCampaigns.length + 1,
              permissionId: p.id,
              userId: p.userId,
              userName: p.userName,
              userEmail: p.userEmail,
              applicationName: p.applicationName,
              roleName: p.roleName,
              reviewerId: null,
              reviewerName: null,
              decision: 'PENDING',
              comments: null,
              reviewedAt: null
            }))
          };
          mockCampaigns.unshift(newCamp);
          return newCamp;
        }
      );
    },
    submitDecision: async (campaignId, itemId, decision, comments) => {
      return callWithFallback(
        () => apiClient.post(`/access-reviews/${campaignId}/items/${itemId}/decision`, { decision, comments }),
        async () => {
          const camp = mockCampaigns.find(c => c.id === Number(campaignId));
          if (camp) {
            const item = camp.items.find(i => i.id === Number(itemId));
            if (item) {
              item.decision = decision;
              item.comments = comments;
              item.reviewedAt = new Date().toISOString();
              item.reviewerName = 'Mia Manager';
            }
          }
          return { message: 'Decision submitted' };
        }
      );
    }
  },

  notifications: {
    getAll: async () => {
      return callWithFallback(
        () => apiClient.get('/notifications'),
        async () => mockNotifications
      );
    },
    getUnreadCount: async () => {
      return callWithFallback(
        () => apiClient.get('/notifications/unread-count'),
        async () => ({ unreadCount: mockNotifications.filter(n => !n.readStatus).length })
      );
    },
    markRead: async (id) => {
      return callWithFallback(
        () => apiClient.patch(`/notifications/${id}/read`),
        async () => {
          const n = mockNotifications.find(item => item.id === Number(id));
          if (n) n.readStatus = true;
          return n;
        }
      );
    },
    markAllRead: async () => {
      return callWithFallback(
        () => apiClient.patch('/notifications/read-all'),
        async () => {
          mockNotifications.forEach(n => { n.readStatus = true; });
          return { message: 'All marked as read' };
        }
      );
    }
  },

  dashboard: {
    getEmployee: async () => {
      return callWithFallback(
        () => apiClient.get('/dashboard/employee'),
        async () => {
          const userStr = localStorage.getItem('accessflow_user');
          const user = userStr ? JSON.parse(userStr) : MOCK_USERS[2];
          const myReqs = mockRequests.filter(r => r.requesterId === user.id);
          const myPerms = mockPermissions.filter(p => p.userId === user.id && p.status === 'ACTIVE');
          return {
            totalRequests: myReqs.length,
            pendingRequests: myReqs.filter(r => r.status.includes('PENDING')).length,
            approvedRequests: myReqs.filter(r => r.status === 'ACCESS_GRANTED').length,
            rejectedRequests: myReqs.filter(r => r.status === 'REJECTED').length,
            activePermissions: myPerms.length,
            unreadNotifications: mockNotifications.filter(n => !n.readStatus).length,
            recentRequests: myReqs.slice(0, 5),
            activePermissionsList: myPerms
          };
        }
      );
    },
    getManager: async () => {
      return callWithFallback(
        () => apiClient.get('/dashboard/manager'),
        async () => {
          const pending = mockRequests.filter(r => r.status === 'PENDING_MANAGER_APPROVAL');
          return {
            pendingApprovals: pending.length,
            totalTeamMembers: 2,
            teamRequestsTotal: mockRequests.length,
            approvedRequests: mockRequests.filter(r => r.status === 'ACCESS_GRANTED' || r.status === 'PENDING_ADMIN_APPROVAL').length,
            rejectedRequests: mockRequests.filter(r => r.status === 'REJECTED').length,
            pendingQueue: pending,
            recentTeamRequests: mockRequests.slice(0, 5)
          };
        }
      );
    },
    getAdmin: async () => {
      return callWithFallback(
        () => apiClient.get('/dashboard/admin'),
        async () => ({
          totalUsers: MOCK_USERS.length,
          activeApplications: MOCK_APPLICATIONS.length,
          pendingManagerApprovals: mockRequests.filter(r => r.status === 'PENDING_MANAGER_APPROVAL').length,
          pendingAdminApprovals: mockRequests.filter(r => r.status === 'PENDING_ADMIN_APPROVAL').length,
          totalApprovedRequests: mockRequests.filter(r => r.status === 'ACCESS_GRANTED').length,
          totalRejectedRequests: mockRequests.filter(r => r.status === 'REJECTED').length,
          activePermissions: mockPermissions.filter(p => p.status === 'ACTIVE').length,
          revokedPermissions: mockPermissions.filter(p => p.status === 'REVOKED').length,
          activeReviewCampaigns: mockCampaigns.filter(c => c.status === 'IN_PROGRESS').length,
          pendingAdminQueue: mockRequests.filter(r => r.status === 'PENDING_ADMIN_APPROVAL'),
          recentAuditEvents: mockAuditLogs.slice(0, 5)
        })
      );
    }
  },

  users: {
    getAll: async () => {
      return callWithFallback(
        () => apiClient.get('/users'),
        async () => MOCK_USERS
      );
    },
    getManagers: async () => {
      return callWithFallback(
        () => apiClient.get('/users/managers'),
        async () => MOCK_USERS.filter(u => u.role === 'MANAGER' || u.role === 'ADMIN')
      );
    },
    create: async (data) => {
      return callWithFallback(
        () => apiClient.post('/users', data),
        async () => {
          const newUser = { id: MOCK_USERS.length + 1, ...data, active: true };
          MOCK_USERS.push(newUser);
          return newUser;
        }
      );
    },
    toggleStatus: async (id) => {
      return callWithFallback(
        () => apiClient.patch(`/users/${id}/status`),
        async () => {
          const u = MOCK_USERS.find(user => user.id === Number(id));
          if (u) u.active = !u.active;
          return u;
        }
      );
    }
  }
};
