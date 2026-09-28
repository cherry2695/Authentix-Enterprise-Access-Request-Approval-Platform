package com.accessflow.service;

import com.accessflow.audit.AuditAction;
import com.accessflow.audit.AuditService;
import com.accessflow.dto.CreateUserRequest;
import com.accessflow.dto.UpdateUserRequest;
import com.accessflow.dto.UserResponse;
import com.accessflow.entity.User;
import com.accessflow.entity.enums.UserRole;
import com.accessflow.exception.BadRequestException;
import com.accessflow.exception.ResourceNotFoundException;
import com.accessflow.mapper.UserMapper;
import com.accessflow.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getFullName))
                .map(UserMapper::toResponse)
                .toList();
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserMapper.toResponse(user);
    }

    public List<UserResponse> getManagers() {
        return userRepository.findAll().stream()
                .filter(u -> u.isActive() && (u.getRole() == UserRole.MANAGER || u.getRole() == UserRole.ADMIN))
                .sorted(Comparator.comparing(User::getFullName))
                .map(UserMapper::toResponse)
                .toList();
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request, User admin) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("A user with this email address already exists.");
        }

        User manager = null;
        if (request.managerId() != null) {
            manager = userRepository.findById(request.managerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + request.managerId()));
        }

        User newUser = User.builder()
                .fullName(request.fullName())
                .email(request.email().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role())
                .manager(manager)
                .active(true)
                .build();

        newUser = userRepository.save(newUser);

        auditService.record(admin, AuditAction.USER_REGISTERED, "User", newUser.getId(),
                null, newUser.getRole().name(), "Created user account " + newUser.getEmail(), null);

        return UserMapper.toResponse(newUser);
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request, User admin) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        String oldRole = user.getRole().name();
        User manager = null;
        if (request.managerId() != null) {
            if (request.managerId().equals(user.getId())) {
                throw new BadRequestException("A user cannot be their own manager.");
            }
            manager = userRepository.findById(request.managerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + request.managerId()));
        }

        user.setFullName(request.fullName());
        user.setRole(request.role());
        user.setManager(manager);
        if (request.active() != null) {
            user.setActive(request.active());
        }

        user = userRepository.save(user);

        if (!oldRole.equals(user.getRole().name())) {
            auditService.record(admin, AuditAction.USER_ROLE_UPDATED, "User", user.getId(),
                    oldRole, user.getRole().name(), "Role updated by admin", null);
        }

        return UserMapper.toResponse(user);
    }

    @Transactional
    public UserResponse toggleUserStatus(Long id, User admin) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (user.getId().equals(admin.getId())) {
            throw new BadRequestException("Administrators cannot deactivate their own account.");
        }

        boolean previousState = user.isActive();
        user.setActive(!previousState);
        user = userRepository.save(user);

        auditService.record(admin, "USER_STATUS_TOGGLED", "User", user.getId(),
                String.valueOf(previousState), String.valueOf(user.isActive()),
                user.isActive() ? "Account activated" : "Account deactivated", null);

        return UserMapper.toResponse(user);
    }
}
