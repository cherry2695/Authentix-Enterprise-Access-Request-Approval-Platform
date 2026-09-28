# AccessFlow — Enterprise Identity Governance & Approval Workflow Engine

[![Spring Boot 3](https://img.shields.io/badge/Spring_Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java 17](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![React 18](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![Vite 5](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![MySQL 8](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Bootstrap 5](https://img.shields.io/badge/Bootstrap-5.3-indigo.svg)](https://getbootstrap.com/)

A comprehensive, production-grade Java Full Stack enterprise web application demonstrating Identity Governance and Administration (IGA), a transactional multi-stage approval engine, role-based authorization, JWT authentication, and an append-only audit trail on top of a normalized MySQL 8 schema.

Designed as a showcase project for technical interviews (e.g. Virtusa) and professional Java Full Stack portfolios.

---

## 1. System Architecture

```
                  ┌──────────────────────────────────────────┐
                  │       Browser Client (React + Vite)      │
                  │  Bootstrap 5, Recharts, Context API      │
                  └────────────────────┬─────────────────────┘
                                       │ Axios + JWT Bearer Token
                                       ▼
                  ┌──────────────────────────────────────────┐
                  │    Spring Boot 3.3.4 REST API Layer      │
                  │   Stateless Security, CORS, Validation   │
                  └────────────────────┬─────────────────────┘
                                       │ Service Layer & Transactions
                                       ▼
                  ┌──────────────────────────────────────────┐
                  │       Spring Data JPA / Hibernate        │
                  │  Repository Interfaces & Specifications  │
                  └────────────────────┬─────────────────────┘
                                       │ JDBC / Connection Pool
                                       ▼
                  ┌──────────────────────────────────────────┐
                  │            MySQL 8 Database              │
                  │   10 Normalized Tables, Constraints, FKs │
                  └──────────────────────────────────────────┘
```

### Backend Layered Architecture (`com.accessflow`)
- **`config/`**: Spring Security filter chains, CORS policies, and automated turnkey `DataInitializer` CommandLineRunner.
- **`security/`**: JWT provider & parser (`JwtUtil`), `JwtAuthFilter`, `CustomUserDetails`, BCrypt hashing.
- **`controller/`**: REST API endpoints with HTTP method semantics, status codes, and `@PreAuthorize` guards.
- **`service/`**: Core business logic, multi-stage workflow transitions, transactional boundaries (`@Transactional`).
- **`repository/`**: Spring Data JPA repositories extending `JpaRepository` and `JpaSpecificationExecutor`.
- **`entity/`**: Relational JPA entities mapped to MySQL tables with audit timestamps and enum constraints.
- **`dto/`**: Request records and response records preventing internal entity leakage.
- **`mapper/`**: Static mappers translating between JPA entities and DTO records.
- **`exception/`**: Centralized `@RestControllerAdvice` (`GlobalExceptionHandler`) producing standardized `ApiError` payloads.
- **`audit/`**: Append-only `AuditService` and `AuditAction` security trail.

---

## 2. Relational Database Design

Full DDL: [`database/schema.sql`](database/schema.sql) · Seed data: [`database/seed.sql`](database/seed.sql)
ER Diagram: [`docs/ER_DIAGRAM.md`](docs/ER_DIAGRAM.md)

### 10 Core Tables:
1. `users` — Enterprise identities, self-referential reporting manager (`manager_id`), BCrypt hash, user role.
2. `applications` — Software systems (CRM, HRMS, Finance Portal, Project Management System), owner, active status.
3. `application_roles` — Granular entitlement levels (VIEWER, EDITOR, ADMIN) scoped to applications.
4. `access_requests` — Employee requests, snapshot of assigned manager, business justification, status.
5. `approval_history` — Immutable decision records (approver, stage, decision, timestamp, comments).
6. `user_permissions` — Active and historical permissions linked directly to approving access request (`access_request_id`).
7. `audit_logs` — Irrevocable append-only audit entries with actor, action, old/new states, reason, and correlation ID.
8. `access_reviews` — Periodic certification campaigns created by administrators.
9. `access_review_items` — Permission audit items in a campaign for retention or revocation.
10. `notifications` — In-app alerts and notifications dispatched on workflow state changes.

---

## 3. Two-Stage Approval Workflow State Machine

```
Employee submits request
        ↓
Request status: PENDING_MANAGER_APPROVAL
        ↓ (Assigned Manager only)
  Approve ──────────────► PENDING_ADMIN_APPROVAL ──(Admin only)──► Approve ──► ACCESS_GRANTED
  Reject  ──► REJECTED                                Reject  ──► REJECTED   (Atomic UserPermission Created)
```

### Core Business Rules Enforced in Service Layer:
- **Designated Approver Check**: Only the manager snapshot on `access_requests.assigned_manager_id` can act at the manager stage.
- **Self-Approval Prevention**: An employee or manager can never approve their own request.
- **Terminal State Lock**: Requests already in `ACCESS_GRANTED`, `REJECTED`, or `CANCELLED` cannot be re-evaluated.
- **Mandatory Rejection Feedback**: Declining a request strictly requires a non-empty explanation comment.
- **Atomic Permission Grant**: Admin approval and `UserPermission` creation execute within a single `@Transactional` method boundary.
- **Append-Only Auditing**: `AuditService` records every transition with correlation IDs and timestamps.

---

## 4. Demo Accounts (Password for all: `Password123!`)

| Role | User Name | Email | Reporting Manager |
|---|---|---|---|
| **ADMIN** | Ava Administrator | `admin@accessflow.io` | *None* |
| **MANAGER** | Mia Manager | `manager@accessflow.io` | *None* |
| **EMPLOYEE** | Ethan Employee | `employee@accessflow.io` | Mia Manager |
| **EMPLOYEE** | Priya Patel | `priya@accessflow.io` | Mia Manager |

---

## 5. Quick Start Instructions

### Option A: Run with Docker Compose (Recommended)

To run the entire ecosystem (MySQL 8, Spring Boot Backend, and React Frontend) with one command:

```bash
# Clone or navigate to the project root
cd AccessFlow

# Build and launch all containers
docker compose up -d

# Verify health
docker compose ps
```

- **Frontend Application**: `http://localhost:5173`
- **Backend REST API**: `http://localhost:8080/api`
- **MySQL Database**: `localhost:3306` (`accessflow_user` / `changeme`)

---

### Option B: Run Locally (Development Mode)

#### 1. Start MySQL 8
Using Docker:
```bash
docker compose up -d mysql
```
Or start your local MySQL 8 server and execute:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

#### 2. Run the Spring Boot Backend
```bash
cd backend
cp .env.example .env

# Run via Maven
mvn spring-boot:run
```
*Note: A turnkey `DataInitializer` is included — if running against a fresh database, demo users, applications, and permissions are automatically seeded!*

#### 3. Run the React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 6. Frontend Pages & Reusable Components

The frontend is styled in a modern enterprise design palette with deep navy blue (`#0f2a4a`), slate accents, and off-white backgrounds (`#f8fafc`):

### Public
- **Login Page**: Includes 1-click demo fill buttons for quick presentation testing.
- **Register Page**: Allows new employee account registration.

### Employee
- **Employee Dashboard**: Key performance metric cards, Recharts status breakdown, and recent requests.
- **Application Catalog**: Searchable system directory with categorized filter pills and "Request Access" modal.
- **My Access Requests**: Filterable data table of submitted requests with cancellation capability.
- **Request Details**: Step-by-step visual `ApprovalTimeline` stepper showing manager/admin signoffs.
- **My Permissions**: Active entitlement inventory with self-service "Relinquish Access" action.
- **Notification Center**: Real-time alerts with unread counter badges and deep links.
- **Profile Page**: Corporate identity attributes and assigned manager details.

### Manager
- **Manager Dashboard**: Team approval workload metrics and pending request queue.
- **Pending Approvals**: Review workbench with employee justification and Approve/Reject modal.
- **Team Overview**: Direct reports and their active application permissions.
- **Approval History**: Team request history log.

### Administrator
- **Admin Dashboard**: Executive enterprise telemetry and pending administrative fulfillment queue.
- **User Management**: Enterprise directory table, status toggle, and "Create User" modal.
- **Application Management**: System and role definitions with modal for creating applications and roles.
- **All Requests**: Global cross-organizational request view with status filters.
- **Global Permissions**: Enterprise-wide granted entitlements with administrative revocation.
- **Audit Trail Explorer**: Append-only compliance log with action filters and modal inspection.
- **Access Review Campaigns**: Periodic certification campaigns with progress tracker and retain/revoke decisions.
- **System Settings**: Identity policies, token TTL, and security configurations.

---

## 7. Testing & Verification

Unit and service-layer tests are located in `backend/src/test/java/com/accessflow/service/`:
- `AccessRequestServiceTest`: Tests happy-path request submission, duplicate pending checks, role-application cross-checks, manager requirement, and cancellation rules.
- `ApprovalServiceTest`: Tests manager approval transitions, mandatory comments on rejection, unauthorized approver rejection, self-approval prevention, and admin transactional permission grants.
- `PermissionServiceTest`: Tests permission retrieval, administrative and self-service revocation, and unauthorized revocation prevention.
- `ApplicationServiceTest`: Tests catalog visibility, duplicate role names, and application creation.

To execute tests:
```bash
cd backend
mvn clean test
```

### Postman API Collection
Import [`postman/AccessFlow.postman_collection.json`](postman/AccessFlow.postman_collection.json) into Postman. Executing "Login as Employee" (or Manager/Admin) automatically populates the `{{token}}` variable for all subsequent requests.

---

## 8. Technical Interview Talking Points (Virtusa Preparation)

1. **Transactional Boundaries (`@Transactional`)**:
   > *"In `ApprovalService.processAdminDecision()`, transitioning the request status to `ACCESS_GRANTED` and creating the `UserPermission` entity are wrapped in the same `@Transactional` method. If permission creation fails for any reason, the entire transaction rolls back so an access request is never marked approved without an actual permission granted."*

2. **Snapshot vs Live Foreign Key**:
   > *"In `access_requests`, `assigned_manager_id` snapshots the employee's manager at the exact moment the request is submitted. If the employee later changes departments or reports to another manager, historical approval audits remain 100% accurate."*

3. **Append-Only Audit Trail**:
   > *"The `AuditService` is the sole entry point for writing to `audit_logs`. The `AuditLogRepository` deliberately exposes no update or delete methods above JPA defaults, and no update/delete REST endpoints exist, guaranteeing compliance and SOC 2 integrity."*

4. **Multi-Tiered Validation**:
   > *"We validate requests at two levels: Bean Validation on DTO records catches malformed inputs at the controller threshold, while the Service layer enforces business rules like in-flight duplicate prevention, active application checks, and role-to-application membership."*

5. **Defense in Depth**:
   > *"We never rely solely on frontend component hiding. Spring Security `@PreAuthorize` method annotations and service-level identity checks verify every action on the server side."*
