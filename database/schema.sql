-- ============================================================
-- AccessFlow - MySQL 8 schema
-- Run this once against an empty database, then set
-- spring.jpa.hibernate.ddl-auto=validate (or none) for that database.
-- ============================================================

CREATE DATABASE IF NOT EXISTS accessflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE accessflow;

-- 1. users -----------------------------------------------------
CREATE TABLE users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(150)  NOT NULL,
    email           VARCHAR(150)  NOT NULL,
    password_hash   VARCHAR(255)  NOT NULL,
    role            VARCHAR(20)   NOT NULL, -- EMPLOYEE | MANAGER | ADMIN
    manager_id      BIGINT        NULL,
    active          BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      DATETIME      NOT NULL,
    updated_at      DATETIME      NOT NULL,
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT fk_users_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_users_manager_id (manager_id)
) ENGINE=InnoDB;

-- 2. applications ------------------------------------------------
CREATE TABLE applications (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150)  NOT NULL,
    description     VARCHAR(1000),
    category        VARCHAR(100),
    owner_id        BIGINT        NULL,
    active          BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      DATETIME      NOT NULL,
    CONSTRAINT fk_applications_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_applications_category (category),
    INDEX idx_applications_active (active)
) ENGINE=InnoDB;

-- 3. application_roles --------------------------------------------
CREATE TABLE application_roles (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id  BIGINT        NOT NULL,
    role_name       VARCHAR(100)  NOT NULL, -- e.g. VIEWER | EDITOR | ADMIN
    description     VARCHAR(500),
    active          BOOLEAN       NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_app_roles_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    CONSTRAINT uq_app_role_per_app UNIQUE (application_id, role_name),
    INDEX idx_app_roles_application_id (application_id)
) ENGINE=InnoDB;

-- 4. access_requests -----------------------------------------------
CREATE TABLE access_requests (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    requester_id          BIGINT        NOT NULL,
    application_id        BIGINT        NOT NULL,
    application_role_id   BIGINT        NOT NULL,
    justification         VARCHAR(1000) NOT NULL,
    status                VARCHAR(30)   NOT NULL, -- see RequestStatus enum
    assigned_manager_id   BIGINT        NULL,
    submitted_at          DATETIME      NOT NULL,
    updated_at            DATETIME      NOT NULL,
    expires_at            DATETIME      NULL,
    CONSTRAINT fk_ar_requester FOREIGN KEY (requester_id) REFERENCES users(id),
    CONSTRAINT fk_ar_application FOREIGN KEY (application_id) REFERENCES applications(id),
    CONSTRAINT fk_ar_application_role FOREIGN KEY (application_role_id) REFERENCES application_roles(id),
    CONSTRAINT fk_ar_manager FOREIGN KEY (assigned_manager_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_access_requests_requester (requester_id),
    INDEX idx_access_requests_status (status),
    INDEX idx_access_requests_manager (assigned_manager_id)
) ENGINE=InnoDB;

-- 5. approval_history -----------------------------------------------
CREATE TABLE approval_history (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    access_request_id   BIGINT        NOT NULL,
    approver_id         BIGINT        NOT NULL,
    approval_stage      VARCHAR(20)   NOT NULL, -- MANAGER | ADMIN
    decision            VARCHAR(20)   NOT NULL, -- APPROVED | REJECTED
    comments            VARCHAR(1000),
    decided_at          DATETIME      NOT NULL,
    CONSTRAINT fk_ah_request FOREIGN KEY (access_request_id) REFERENCES access_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_ah_approver FOREIGN KEY (approver_id) REFERENCES users(id),
    INDEX idx_approval_history_request (access_request_id)
) ENGINE=InnoDB;

-- 6. user_permissions -----------------------------------------------
CREATE TABLE user_permissions (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id               BIGINT        NOT NULL,
    application_id        BIGINT        NOT NULL,
    application_role_id   BIGINT        NOT NULL,
    access_request_id     BIGINT        NULL,
    granted_by            BIGINT        NOT NULL,
    granted_at            DATETIME      NOT NULL,
    expires_at            DATETIME      NULL,
    revoked_at            DATETIME      NULL,
    status                VARCHAR(20)   NOT NULL, -- ACTIVE | REVOKED | EXPIRED
    CONSTRAINT fk_up_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_up_application FOREIGN KEY (application_id) REFERENCES applications(id),
    CONSTRAINT fk_up_application_role FOREIGN KEY (application_role_id) REFERENCES application_roles(id),
    CONSTRAINT fk_up_request FOREIGN KEY (access_request_id) REFERENCES access_requests(id) ON DELETE SET NULL,
    CONSTRAINT fk_up_granted_by FOREIGN KEY (granted_by) REFERENCES users(id),
    INDEX idx_user_permissions_user (user_id),
    INDEX idx_user_permissions_status (status)
) ENGINE=InnoDB;

-- 7. audit_logs -----------------------------------------------------
CREATE TABLE audit_logs (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_id        BIGINT        NULL,
    action          VARCHAR(60)   NOT NULL,
    entity_type     VARCHAR(60),
    entity_id       BIGINT,
    old_value       TEXT,
    new_value       TEXT,
    reason          VARCHAR(1000),
    created_at      DATETIME      NOT NULL,
    correlation_id  VARCHAR(100),
    CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_logs_actor (actor_id),
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_created_at (created_at),
    INDEX idx_audit_logs_entity (entity_type, entity_id)
) ENGINE=InnoDB;

-- 8. access_reviews ---------------------------------------------------
CREATE TABLE access_reviews (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    campaign_name   VARCHAR(150)  NOT NULL,
    description     VARCHAR(1000),
    created_by      BIGINT        NOT NULL,
    start_date      DATE          NOT NULL,
    due_date        DATE          NOT NULL,
    status          VARCHAR(20)   NOT NULL, -- IN_PROGRESS | COMPLETED
    created_at      DATETIME      NOT NULL,
    CONSTRAINT fk_reviews_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- 9. access_review_items -----------------------------------------------
CREATE TABLE access_review_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    review_id       BIGINT        NOT NULL,
    permission_id   BIGINT        NOT NULL,
    reviewer_id     BIGINT        NULL,
    decision        VARCHAR(30)   NOT NULL, -- PENDING | APPROVED_RETAIN | FLAGGED_FOR_REVOCATION
    comments        VARCHAR(1000),
    reviewed_at     DATETIME      NULL,
    CONSTRAINT fk_review_items_review FOREIGN KEY (review_id) REFERENCES access_reviews(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_items_permission FOREIGN KEY (permission_id) REFERENCES user_permissions(id),
    CONSTRAINT fk_review_items_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_review_items_review (review_id)
) ENGINE=InnoDB;

-- 10. notifications ------------------------------------------------------
CREATE TABLE notifications (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT        NOT NULL,
    title               VARCHAR(150)  NOT NULL,
    message             VARCHAR(500)  NOT NULL,
    notification_type   VARCHAR(30)   NOT NULL,
    reference_id        BIGINT        NULL,
    read_status         BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at          DATETIME      NOT NULL,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read (read_status)
) ENGINE=InnoDB;
