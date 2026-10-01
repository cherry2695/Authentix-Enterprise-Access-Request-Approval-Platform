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

## System Architecture

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

## Two-Stage Approval Workflow State Machine

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

## Demo Accounts (Password for all: `Password123!`)

| Role | User Name | Email | Reporting Manager |
|---|---|---|---|
| **ADMIN** | Ava Administrator | `admin@accessflow.io` | *None* |
| **MANAGER** | Mia Manager | `manager@accessflow.io` | *None* |
| **EMPLOYEE** | Ethan Employee | `employee@accessflow.io` | Mia Manager |
| **EMPLOYEE** | Priya Patel | `priya@accessflow.io` | Mia Manager |


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
