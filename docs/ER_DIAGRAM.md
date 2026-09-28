# AccessFlow — Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ USERS : "manages"
    USERS ||--o{ APPLICATIONS : "owns"
    APPLICATIONS ||--o{ APPLICATION_ROLES : "defines"
    USERS ||--o{ ACCESS_REQUESTS : "submits"
    USERS ||--o{ ACCESS_REQUESTS : "is assigned manager for"
    APPLICATIONS ||--o{ ACCESS_REQUESTS : "targeted by"
    APPLICATION_ROLES ||--o{ ACCESS_REQUESTS : "requested as"
    ACCESS_REQUESTS ||--o{ APPROVAL_HISTORY : "has decisions"
    USERS ||--o{ APPROVAL_HISTORY : "approves as"
    ACCESS_REQUESTS ||--o| USER_PERMISSIONS : "grants"
    USERS ||--o{ USER_PERMISSIONS : "holds"
    APPLICATIONS ||--o{ USER_PERMISSIONS : "scopes"
    APPLICATION_ROLES ||--o{ USER_PERMISSIONS : "scopes"
    USERS ||--o{ USER_PERMISSIONS : "granted by"
    USERS ||--o{ AUDIT_LOGS : "acts in"
    USERS ||--o{ ACCESS_REVIEWS : "creates"
    ACCESS_REVIEWS ||--o{ ACCESS_REVIEW_ITEMS : "contains"
    USER_PERMISSIONS ||--o{ ACCESS_REVIEW_ITEMS : "reviewed in"
    USERS ||--o{ ACCESS_REVIEW_ITEMS : "reviews"
    USERS ||--o{ NOTIFICATIONS : "receives"

    USERS {
        bigint id PK
        varchar full_name
        varchar email UK
        varchar password_hash
        varchar role
        bigint manager_id FK
        boolean active
        datetime created_at
        datetime updated_at
    }
    APPLICATIONS {
        bigint id PK
        varchar name
        varchar description
        varchar category
        bigint owner_id FK
        boolean active
        datetime created_at
    }
    APPLICATION_ROLES {
        bigint id PK
        bigint application_id FK
        varchar role_name
        varchar description
        boolean active
    }
    ACCESS_REQUESTS {
        bigint id PK
        bigint requester_id FK
        bigint application_id FK
        bigint application_role_id FK
        varchar justification
        varchar status
        bigint assigned_manager_id FK
        datetime submitted_at
        datetime updated_at
        datetime expires_at
    }
    APPROVAL_HISTORY {
        bigint id PK
        bigint access_request_id FK
        bigint approver_id FK
        varchar approval_stage
        varchar decision
        varchar comments
        datetime decided_at
    }
    USER_PERMISSIONS {
        bigint id PK
        bigint user_id FK
        bigint application_id FK
        bigint application_role_id FK
        bigint access_request_id FK
        bigint granted_by FK
        datetime granted_at
        datetime expires_at
        datetime revoked_at
        varchar status
    }
    AUDIT_LOGS {
        bigint id PK
        bigint actor_id FK
        varchar action
        varchar entity_type
        bigint entity_id
        text old_value
        text new_value
        varchar reason
        datetime created_at
        varchar correlation_id
    }
    ACCESS_REVIEWS {
        bigint id PK
        varchar campaign_name
        varchar description
        bigint created_by FK
        date start_date
        date due_date
        varchar status
        datetime created_at
    }
    ACCESS_REVIEW_ITEMS {
        bigint id PK
        bigint review_id FK
        bigint permission_id FK
        bigint reviewer_id FK
        varchar decision
        varchar comments
        datetime reviewed_at
    }
    NOTIFICATIONS {
        bigint id PK
        bigint user_id FK
        varchar title
        varchar message
        varchar notification_type
        bigint reference_id
        boolean read_status
        datetime created_at
    }
```

## Key relationship notes

- `users.manager_id` is a **self-referential FK** — this is how an employee's approving manager is determined.
- `access_requests.assigned_manager_id` is a **snapshot** of the requester's manager at submission time, so a later org-chart change doesn't retroactively change who approved (or should have approved) a historical request.
- `approval_history` is an **append-only** log of every manager/admin decision on a request — one request can have up to two rows (manager stage, admin stage), or more if you extend the workflow.
- `user_permissions.access_request_id` links a granted permission back to the request whose full two-stage approval produced it — permissions are never created directly.
- `audit_logs` is intentionally decoupled from strong FK cascade behavior on the entity side (actor can be null-safe on user deletion) so the trail survives account lifecycle changes.
