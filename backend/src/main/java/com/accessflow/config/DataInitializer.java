package com.accessflow.config;

import com.accessflow.audit.AuditAction;
import com.accessflow.audit.AuditService;
import com.accessflow.entity.*;
import com.accessflow.entity.enums.*;
import com.accessflow.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationRoleRepository applicationRoleRepository;
    private final AccessRequestRepository accessRequestRepository;
    private final UserPermissionRepository userPermissionRepository;
    private final ApprovalHistoryRepository approvalHistoryRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public DataInitializer(UserRepository userRepository,
                           ApplicationRepository applicationRepository,
                           ApplicationRoleRepository applicationRoleRepository,
                           AccessRequestRepository accessRequestRepository,
                           UserPermissionRepository userPermissionRepository,
                           ApprovalHistoryRepository approvalHistoryRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder,
                           AuditService auditService) {
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.applicationRoleRepository = applicationRoleRepository;
        this.accessRequestRepository = accessRequestRepository;
        this.userPermissionRepository = userPermissionRepository;
        this.approvalHistoryRepository = approvalHistoryRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded with {} users. Skipping automatic DataInitializer.", userRepository.count());
            return;
        }

        log.info("Fresh database detected. Seeding demo accounts, applications, roles, and baseline data...");

        String defaultEncodedPassword = passwordEncoder.encode("Password123!");

        // 1. Seed Users
        User admin = User.builder()
                .fullName("Ava Administrator")
                .email("admin@accessflow.io")
                .passwordHash(defaultEncodedPassword)
                .role(UserRole.ADMIN)
                .active(true)
                .build();
        admin = userRepository.save(admin);

        User manager = User.builder()
                .fullName("Mia Manager")
                .email("manager@accessflow.io")
                .passwordHash(defaultEncodedPassword)
                .role(UserRole.MANAGER)
                .active(true)
                .build();
        manager = userRepository.save(manager);

        User employee1 = User.builder()
                .fullName("Ethan Employee")
                .email("employee@accessflow.io")
                .passwordHash(defaultEncodedPassword)
                .role(UserRole.EMPLOYEE)
                .manager(manager)
                .active(true)
                .build();
        employee1 = userRepository.save(employee1);

        User employee2 = User.builder()
                .fullName("Priya Patel")
                .email("priya@accessflow.io")
                .passwordHash(defaultEncodedPassword)
                .role(UserRole.EMPLOYEE)
                .manager(manager)
                .active(true)
                .build();
        employee2 = userRepository.save(employee2);

        // 2. Seed Applications
        Application crm = applicationRepository.save(Application.builder()
                .name("CRM")
                .description("Customer relationship management system")
                .category("Sales")
                .owner(admin)
                .active(true)
                .build());

        Application hrms = applicationRepository.save(Application.builder()
                .name("HRMS")
                .description("Human resources management system")
                .category("HR")
                .owner(admin)
                .active(true)
                .build());

        Application finance = applicationRepository.save(Application.builder()
                .name("Finance Portal")
                .description("Budgeting, invoicing and expense management portal")
                .category("Finance")
                .owner(admin)
                .active(true)
                .build());

        Application projectApp = applicationRepository.save(Application.builder()
                .name("Project Management System")
                .description("Project and sprint tracking tool")
                .category("Operations")
                .owner(admin)
                .active(true)
                .build());

        // 3. Seed Roles
        ApplicationRole crmViewer = applicationRoleRepository.save(ApplicationRole.builder()
                .application(crm).roleName("VIEWER").description("Read-only access to customer records").active(true).build());
        ApplicationRole crmEditor = applicationRoleRepository.save(ApplicationRole.builder()
                .application(crm).roleName("EDITOR").description("Can create and edit customer records").active(true).build());
        ApplicationRole crmAdmin = applicationRoleRepository.save(ApplicationRole.builder()
                .application(crm).roleName("ADMIN").description("Full administrative access to CRM").active(true).build());

        ApplicationRole hrmsViewer = applicationRoleRepository.save(ApplicationRole.builder()
                .application(hrms).roleName("VIEWER").description("Read-only access to HR records").active(true).build());
        ApplicationRole hrmsEditor = applicationRoleRepository.save(ApplicationRole.builder()
                .application(hrms).roleName("EDITOR").description("Can manage employee records").active(true).build());

        ApplicationRole financeViewer = applicationRoleRepository.save(ApplicationRole.builder()
                .application(finance).roleName("VIEWER").description("Read-only access to financial reports").active(true).build());
        ApplicationRole financeEditor = applicationRoleRepository.save(ApplicationRole.builder()
                .application(finance).roleName("EDITOR").description("Can create invoices and expense reports").active(true).build());

        ApplicationRole projectViewer = applicationRoleRepository.save(ApplicationRole.builder()
                .application(projectApp).roleName("VIEWER").description("Read-only access to project boards").active(true).build());
        ApplicationRole projectEditor = applicationRoleRepository.save(ApplicationRole.builder()
                .application(projectApp).roleName("EDITOR").description("Can create and update sprint tasks").active(true).build());

        // 4. Seed an Active Permission
        UserPermission initialPerm = UserPermission.builder()
                .user(employee1)
                .application(crm)
                .applicationRole(crmViewer)
                .grantedBy(admin)
                .grantedAt(LocalDateTime.now().minusDays(10))
                .status(PermissionStatus.ACTIVE)
                .build();
        userPermissionRepository.save(initialPerm);

        // 5. Seed In-Flight Request: Pending Manager Approval
        AccessRequest request1 = AccessRequest.builder()
                .requester(employee1)
                .application(crm)
                .applicationRole(crmEditor)
                .justification("I need edit access to CRM to update customer contact details for the Q4 renewal campaign.")
                .status(RequestStatus.PENDING_MANAGER_APPROVAL)
                .assignedManager(manager)
                .build();
        request1 = accessRequestRepository.save(request1);

        // 6. Seed In-Flight Request: Pending Admin Approval (already approved by manager)
        AccessRequest request2 = AccessRequest.builder()
                .requester(employee2)
                .application(finance)
                .applicationRole(financeViewer)
                .justification("Require view access to Finance Portal to review vendor payment vouchers for department audit.")
                .status(RequestStatus.PENDING_ADMIN_APPROVAL)
                .assignedManager(manager)
                .build();
        request2 = accessRequestRepository.save(request2);

        approvalHistoryRepository.save(ApprovalHistory.builder()
                .accessRequest(request2)
                .approver(manager)
                .approvalStage(ApprovalStage.MANAGER)
                .decision(ApprovalDecision.APPROVED)
                .comments("Approved. Priya is conducting the quarterly vendor reconciliation.")
                .build());

        // 7. Seed Initial Notification
        notificationRepository.save(Notification.builder()
                .user(manager)
                .title("New Approval Required")
                .message("Ethan Employee has requested EDITOR access to CRM.")
                .notificationType(NotificationType.REQUEST_SUBMITTED)
                .referenceId(request1.getId())
                .readStatus(false)
                .build());

        notificationRepository.save(Notification.builder()
                .user(admin)
                .title("Admin Review Required")
                .message("Request #" + request2.getId() + " from Priya Patel for Finance Portal is awaiting admin approval.")
                .notificationType(NotificationType.REQUEST_APPROVED)
                .referenceId(request2.getId())
                .readStatus(false)
                .build());

        // 8. Baseline Audit Records
        auditService.record(admin, "SYSTEM_SEED_INITIALIZED", "System", 1L,
                null, "INITIALIZED", "System initialized with baseline demo data", null);

        log.info("Database seeding completed successfully. Demo accounts are ready.");
    }
}
