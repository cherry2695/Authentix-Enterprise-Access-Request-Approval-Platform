# AccessFlow — REST API Specification & Architecture Guide

Base URL: `http://localhost:8080/api`

Authentication: Bearer Token via HTTP Header `Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication & Identity (`/api/auth`)

### 1.1 Login
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "employee@accessflow.io",
    "password": "Password123!"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": 3,
      "fullName": "Ethan Employee",
      "email": "employee@accessflow.io",
      "role": "EMPLOYEE",
      "managerId": 2,
      "managerName": "Mia Manager",
      "active": true
    }
  }
  ```

### 1.2 Register
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "fullName": "John Doe",
    "email": "john.doe@accessflow.io",
    "password": "Password123!"
  }
  ```
- **Response** (`201 CREATED`)

### 1.3 Current User Info
- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Access**: Authenticated

---

## 2. User Management (`/api/users`)

### 2.1 List All Users
- **Method**: `GET`
- **Path**: `/api/users`
- **Access**: `ROLE_ADMIN`

### 2.2 List Managers (for dropdowns)
- **Method**: `GET`
- **Path**: `/api/users/managers`
- **Access**: Authenticated

### 2.3 Create User
- **Method**: `POST`
- **Path**: `/api/users`
- **Access**: `ROLE_ADMIN`
- **Request Body**:
  ```json
  {
    "fullName": "Sara Connor",
    "email": "sara@accessflow.io",
    "password": "Password123!",
    "role": "EMPLOYEE",
    "managerId": 2
  }
  ```

### 2.4 Toggle Status (Activate / Deactivate)
- **Method**: `PATCH`
- **Path**: `/api/users/{id}/status`
- **Access**: `ROLE_ADMIN`

---

## 3. Applications & Roles Catalog (`/api/applications`)

### 3.1 List Applications
- **Method**: `GET`
- **Path**: `/api/applications?category=Sales&search=CRM`
- **Access**: Authenticated

### 3.2 Get Application by ID
- **Method**: `GET`
- **Path**: `/api/applications/{id}`
- **Access**: Authenticated

### 3.3 List Roles for Application
- **Method**: `GET`
- **Path**: `/api/applications/{id}/roles`
- **Access**: Authenticated

### 3.4 Create Application
- **Method**: `POST`
- **Path**: `/api/applications`
- **Access**: `ROLE_ADMIN`
- **Request Body**:
  ```json
  {
    "name": "Cloud CRM",
    "category": "Sales",
    "description": "Customer relationship management system",
    "ownerId": 1
  }
  ```

### 3.5 Add Role to Application
- **Method**: `POST`
- **Path**: `/api/applications/{id}/roles`
- **Access**: `ROLE_ADMIN`
- **Request Body**:
  ```json
  {
    "roleName": "ADMIN",
    "description": "Full administrative access"
  }
  ```

---

## 4. Access Requests (`/api/access-requests`)

### 4.1 Submit Access Request
- **Method**: `POST`
- **Path**: `/api/access-requests`
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "applicationId": 1,
    "applicationRoleId": 2,
    "justification": "Need editor access to update customer contact records for renewal campaign."
  }
  ```
- **Response** (`201 CREATED`):
  Initial status: `PENDING_MANAGER_APPROVAL`

### 4.2 Get My Requests
- **Method**: `GET`
- **Path**: `/api/access-requests/my`
- **Access**: Authenticated

### 4.3 Get Request by ID
- **Method**: `GET`
- **Path**: `/api/access-requests/{id}`
- **Access**: Requester, Assigned Manager, or `ROLE_ADMIN`

### 4.4 Cancel Request
- **Method**: `PATCH`
- **Path**: `/api/access-requests/{id}/cancel`
- **Access**: Requester only (allowed while pending approval)

---

## 5. Multi-Level Approval Workflow (`/api/approvals`)

### 5.1 Get Pending Queue
- **Method**: `GET`
- **Path**: `/api/approvals/pending`
- **Access**: `ROLE_MANAGER`, `ROLE_ADMIN`
  - Returns requests assigned to manager if `MANAGER`.
  - Returns requests awaiting admin if `ADMIN`.

### 5.2 Manager Decision
- **Method**: `POST`
- **Path**: `/api/approvals/{id}/manager-decision`
- **Access**: `ROLE_MANAGER` (enforced that caller matches `assignedManagerId`)
- **Request Body**:
  ```json
  {
    "decision": "APPROVED", // or "REJECTED"
    "comments": "Approved for renewal campaign."
  }
  ```
  *Note: Comments are mandatory if decision is REJECTED.*
  *Transitions to: `PENDING_ADMIN_APPROVAL` (if approved) or `REJECTED`.*

### 5.3 Administrator Decision & Fulfillment
- **Method**: `POST`
- **Path**: `/api/approvals/{id}/admin-decision`
- **Access**: `ROLE_ADMIN`
- **Request Body**:
  ```json
  {
    "decision": "APPROVED", // or "REJECTED"
    "comments": "Security verification complete. Permission provisioned."
  }
  ```
  *Note: On APPROVED, status transitions to `ACCESS_GRANTED` and `UserPermission` is created atomically.*

### 5.4 Get Request Approval History
- **Method**: `GET`
- **Path**: `/api/approvals/{id}/history`
- **Access**: Requester, Assigned Manager, or `ROLE_ADMIN`

### 5.5 Get Team Requests
- **Method**: `GET`
- **Path**: `/api/approvals/team`
- **Access**: `ROLE_MANAGER`, `ROLE_ADMIN`

---

## 6. Permissions Management (`/api/permissions`)

### 6.1 List All Enterprise Permissions
- **Method**: `GET`
- **Path**: `/api/permissions?status=ACTIVE`
- **Access**: `ROLE_ADMIN`

### 6.2 Get My Permissions
- **Method**: `GET`
- **Path**: `/api/permissions/my`
- **Access**: Authenticated

### 6.3 Revoke Permission
- **Method**: `POST`
- **Path**: `/api/permissions/{id}/revoke`
- **Access**: `ROLE_ADMIN` or Employee Self-Revocation
- **Request Body**:
  ```json
  {
    "reason": "Project completed. Access no longer needed."
  }
  ```

---

## 7. Audit Log Explorer (`/api/audit-logs`)

### 7.1 Search & Filter Audit Logs
- **Method**: `GET`
- **Path**: `/api/audit-logs?action=PERMISSION_GRANTED&page=0&size=20`
- **Access**: `ROLE_ADMIN`

### 7.2 Get Audit Log Entry by ID
- **Method**: `GET`
- **Path**: `/api/audit-logs/{id}`
- **Access**: `ROLE_ADMIN`

### 7.3 Get Recent Audit Logs
- **Method**: `GET`
- **Path**: `/api/audit-logs/recent?limit=10`
- **Access**: `ROLE_ADMIN`

---

## 8. Access Review Campaigns (`/api/access-reviews`)

### 8.1 Create Certification Campaign
- **Method**: `POST`
- **Path**: `/api/access-reviews`
- **Access**: `ROLE_ADMIN`
- **Request Body**:
  ```json
  {
    "campaignName": "Q4 2026 Access Certification",
    "description": "Quarterly audit of active permissions across all systems",
    "startDate": "2026-10-01",
    "dueDate": "2026-10-31"
  }
  ```

### 8.2 List Campaigns
- **Method**: `GET`
- **Path**: `/api/access-reviews`
- **Access**: `ROLE_MANAGER`, `ROLE_ADMIN`

### 8.3 Get Campaign Items
- **Method**: `GET`
- **Path**: `/api/access-reviews/{id}/items`
- **Access**: `ROLE_MANAGER`, `ROLE_ADMIN`

### 8.4 Submit Review Decision on Item
- **Method**: `POST`
- **Path**: `/api/access-reviews/{id}/items/{itemId}/decision`
- **Access**: `ROLE_MANAGER`, `ROLE_ADMIN`
- **Request Body**:
  ```json
  {
    "decision": "APPROVED_RETAIN", // or "FLAGGED_FOR_REVOCATION"
    "comments": "Confirmed necessary for current job duties."
  }
  ```

---

## 9. In-App Notifications (`/api/notifications`)

### 9.1 Get My Notifications
- **Method**: `GET`
- **Path**: `/api/notifications`
- **Access**: Authenticated

### 9.2 Get Unread Count
- **Method**: `GET`
- **Path**: `/api/notifications/unread-count`
- **Access**: Authenticated

### 9.3 Mark as Read
- **Method**: `PATCH`
- **Path**: `/api/notifications/{id}/read`
- **Access**: Authenticated

### 9.4 Mark All Read
- **Method**: `PATCH`
- **Path**: `/api/notifications/read-all`
- **Access**: Authenticated

---

## 10. Dashboard Analytics (`/api/dashboard`)

### 10.1 Employee Dashboard
- **Method**: `GET`
- **Path**: `/api/dashboard/employee`
- **Access**: Authenticated

### 10.2 Manager Dashboard
- **Method**: `GET`
- **Path**: `/api/dashboard/manager`
- **Access**: `ROLE_MANAGER`, `ROLE_ADMIN`

### 10.3 Admin Dashboard
- **Method**: `GET`
- **Path**: `/api/dashboard/admin`
- **Access**: `ROLE_ADMIN`
